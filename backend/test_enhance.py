import os
import sys
import json
import urllib.request
import urllib.error
import uuid

tile_path = os.path.join(os.path.dirname(__file__), 'data', 'demo_tiles', 'crop_01.jpg')

def test_live_server():
    print('Testing live server at http://localhost:8000/api/enhance...')
    url = 'http://localhost:8000/api/enhance'
    boundary = uuid.uuid4().hex
    
    with open(tile_path, 'rb') as f:
        img_data = f.read()
        
    data = []
    data.append(('--' + boundary).encode('utf-8'))
    data.append(('Content-Disposition: form-data; name="file"; filename="crop_01.jpg"').encode('utf-8'))
    data.append(b'Content-Type: image/jpeg')
    data.append(b'')
    data.append(img_data)
    data.append(('--' + boundary + '--').encode('utf-8'))
    data.append(b'')
    
    body = b'\r\n'.join(data)
    
    req = urllib.request.Request(url, data=body, headers={
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': len(body)
    })
    
    resp = urllib.request.urlopen(req, timeout=30)
    result = json.loads(resp.read())
    print('Live Enhance success!')
    print(json.dumps(result['metrics'], indent=2))
    return True

def test_testclient():
    print('Live server not detected on port 8000. Running in-memory TestClient verification...')
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    with open(tile_path, 'rb') as f:
        res = client.post('/api/enhance', files={'file': ('crop_01.jpg', f, 'image/jpeg')})
    assert res.status_code == 200, f"Error: {res.text}"
    result = res.json()
    print('TestClient Enhance success!')
    print(json.dumps(result['metrics'], indent=2))
    return True

if __name__ == '__main__':
    try:
        test_live_server()
    except Exception as e:
        print(f"Notice: {e}")
        test_testclient()
