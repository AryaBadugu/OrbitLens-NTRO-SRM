import re
import logging
from typing import Dict, Any, Optional
from services.agmarknet_service import get_market_prices, get_nearest_markets, get_upstream_status
from services.imd_service import get_current_weather, get_city_forecast, get_weather_warnings
from services.prediction_service import predict_commodity_price

logger = logging.getLogger("krishipulse.chatbot")
logger.setLevel(logging.INFO)

CROP_MAP = {
    "onion": "Onion", "प्याज": "Onion", "प्याज़": "Onion", "कांदा": "Onion",
    "tomato": "Tomato", "टमाटर": "Tomato", "टोमॅटो": "Tomato",
    "potato": "Potato", "आलू": "Potato", "बटाटा": "Potato",
    "banana": "Banana", "केला": "Banana", "केळी": "Banana",
    "mango": "Mango", "आम": "Mango", "आंबा": "Mango",
    "okra": "Okra", "bhindi": "Okra", "bhendi": "Okra", "भिंडी": "Okra", "भेंडी": "Okra",
    "chickpea": "Chickpea", "chana": "Chickpea", "gram": "Chickpea", "चना": "Chickpea", "हरभरा": "Chickpea",
    "sugarcane": "Sugarcane", "ganna": "Sugarcane", "गन्ना": "Sugarcane", "ऊस": "Sugarcane",
    "chilli": "Chilli", "chili": "Chilli", "मिर्च": "Chilli", "मिरची": "Chilli",
    "wheat": "Wheat", "गेहूं": "Wheat", "गहू": "Wheat",
    "rice": "Rice", "चावल": "Rice", "तांदूळ": "Rice", "भात": "Rice",
    "maize": "Maize", "मक्का": "Maize", "मका": "Maize",
    "cotton": "Cotton", "कपास": "Cotton", "कापूस": "Cotton",
    "soybean": "Soybean", "सोयाबीन": "Soybean",
    "garlic": "Garlic", "लहसुन": "Garlic", "लसूण": "Garlic",
}

LOCATION_MAP = {
    "nashik": "Nashik", "नाशिक": "Nashik",
    "lasalgaon": "Lasalgaon", "लासलगाव": "Lasalgaon",
    "pimpalgaon": "Pimpalgaon", "पिंपळगाव": "Pimpalgaon",
    "azadpur": "Azadpur", "आजादपुर": "Azadpur",
    "vashi": "Vashi", "वाशी": "Vashi",
    "kolar": "Kolar", "कोलार": "Kolar",
    "guntur": "Guntur", "गुंटूर": "Guntur",
    "indore": "Indore", "इंदौर": "Indore",
    "surat": "Surat", "सूरत": "Surat",
    "khanna": "Khanna", "खन्ना": "Khanna",
    "karnal": "Karnal", "करनाल": "Karnal",
    "shimla": "Shimla", "शिमला": "Shimla",
    "delhi": "Delhi", "दिल्ली": "Delhi",
    "agra": "Agra", "आगरा": "Agra",
    "ludhiana": "Ludhiana", "लुधियाना": "Ludhiana",
    "bhopal": "Bhopal", "भोपाल": "Bhopal"
}

CROP_DISPLAY = {
    "hi": {
        "Onion": "प्याज",
        "Tomato": "टमाटर",
        "Potato": "आलू",
        "Banana": "केला",
        "Mango": "आम",
        "Okra": "भिंडी",
        "Chickpea": "चना",
        "Sugarcane": "गन्ना",
        "Chilli": "मिर्च",
        "Wheat": "गेहूं",
        "Rice": "चावल",
        "Maize": "मक्का",
        "Cotton": "कपास",
        "Soybean": "सोयाबीन",
        "Garlic": "लहसुन",
    },
    "mr": {
        "Onion": "कांदा",
        "Tomato": "टोमॅटो",
        "Potato": "बटाटा",
        "Banana": "केळी",
        "Mango": "आंबा",
        "Okra": "भेंडी",
        "Chickpea": "हरभरा",
        "Sugarcane": "ऊस",
        "Chilli": "मिरची",
        "Wheat": "गहू",
        "Rice": "तांदूळ",
        "Maize": "मका",
        "Cotton": "कापूस",
        "Soybean": "सोयाबीन",
        "Garlic": "लसूण",
    }
}


def normalize_lang(language: Optional[str]) -> str:
    if not language:
        return "en"
    lang = language.lower().strip()
    if "mr" in lang or "marathi" in lang:
        return "mr"
    if "hi" in lang or "hindi" in lang:
        return "hi"
    return "en"


def get_crop_display(crop: str, lang_code: str) -> str:
    if lang_code in CROP_DISPLAY and crop in CROP_DISPLAY[lang_code]:
        return CROP_DISPLAY[lang_code][crop]
    return crop


def extract_commodity(text: str, default_commodity: Optional[str] = "Onion") -> str:
    text_lower = text.lower()
    for crop_key, crop_name in CROP_MAP.items():
        if crop_key in text_lower:
            return crop_name
    if default_commodity:
        def_lower = default_commodity.lower().strip()
        for crop_key, crop_name in CROP_MAP.items():
            if crop_key in def_lower:
                return crop_name
        return default_commodity.capitalize()
    return "Onion"


def extract_location(text: str) -> str:
    text_lower = text.lower()
    for loc_key, loc_name in LOCATION_MAP.items():
        if loc_key in text_lower:
            return loc_name
    return "Nashik"


def process_chat_message(
    user_message: str,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    language: Optional[str] = "en-IN",
    commodity: Optional[str] = "onion"
) -> Dict[str, Any]:
    """Processes farmer chat requests using real backend tools and factual data citations in the requested language."""
    msg = user_message.strip()
    msg_lower = msg.lower()
    lang_code = normalize_lang(language)
    
    crop = extract_commodity(msg, default_commodity=commodity)
    crop_disp = get_crop_display(crop, lang_code)
    location = extract_location(msg)
    
    # 1. Nearest Mandi / Distance / Mandi comparison queries
    if any(k in msg_lower for k in [
        "nearest", "nearby", "close", "distance", "highest", "consider", "best mandi", "mandi",
        "निकटतम", "पास", "मंडी", "दूरी", "सर्वश्रेष्ठ",
        "जवळची", "जवळील", "मंडई", "अंतर", "उत्तम"
    ]):
        user_lat = lat if lat is not None else 19.9975
        user_lon = lon if lon is not None else 73.7898
        
        nearest_data = get_nearest_markets(user_lat, user_lon, commodity=crop, limit=5)
        mandis = nearest_data.get("nearest_markets", [])
        
        if not mandis:
            if lang_code == "hi":
                reply = f"**{crop_disp}** के लिए वर्तमान में कोई मंडी रिकॉर्ड उपलब्ध नहीं है।"
            elif lang_code == "mr":
                reply = f"**{crop_disp}** साठी सध्या कोणतीही बाजार नोंद उपलब्ध नाही."
            else:
                reply = f"No market records currently available for **{crop_disp}**."
            return {
                "reply": reply,
                "data_source": "Government of India OGD / AGMARKNET",
                "citations": [],
                "tools_used": ["get_nearest_markets"]
            }
            
        best = max(mandis, key=lambda x: x["modal_price"]) if any(k in msg_lower for k in ["highest", "best", "सर्वश्रेष्ठ", "उत्तम"]) else mandis[0]
        
        if lang_code == "hi":
            reply_lines = [
                f"**{crop_disp}** के लिए वास्तविक AGMARKNET डेटा पर आधारित:",
                f"• **अनुशंसित मंडी**: {best['market']} ({best['district']}, {best['state']})",
                f"• **मॉडल मूल्य**: ₹{best['modal_price']} / क्विंटल (न्यूनतम: ₹{best['min_price']}, अधिकतम: ₹{best['max_price']})",
                f"• **दूरी**: आपके स्थान से {best['distance_km']} किमी",
                f"• **आवक तिथि**: {best['arrival_date']}",
                "\nअन्य निकटतम मंडियां:"
            ]
            for m in mandis:
                reply_lines.append(f"- **{m['market']}**: ₹{m['modal_price']}/क्विंटल ({m['distance_km']} किमी दूर)")
        elif lang_code == "mr":
            reply_lines = [
                f"**{crop_disp}** साठी अंतिम AGMARKNET माहितीवर आधारित:",
                f"• **शिफारस केलेली मंडई**: {best['market']} ({best['district']}, {best['state']})",
                f"• **क्विंटल दर (Modal Price)**: ₹{best['modal_price']} / क्विंटल (किमान: ₹{best['min_price']}, कमाल: ₹{best['max_price']})",
                f"• **अंतर**: तुमच्या स्थानापासून {best['distance_km']} किमी",
                f"• **आवक तारीख**: {best['arrival_date']}",
                "\nइतर जवळील मंडई:"
            ]
            for m in mandis:
                reply_lines.append(f"- **{m['market']}**: ₹{m['modal_price']}/क्विंटल ({m['distance_km']} किमी अंतर)")
        else:
            reply_lines = [
                f"Based on real AGMARKNET data for **{crop_disp}**:",
                f"• **Recommended Mandi**: {best['market']} ({best['district']}, {best['state']})",
                f"• **Modal Price**: ₹{best['modal_price']} / Quintal (Min: ₹{best['min_price']}, Max: ₹{best['max_price']})",
                f"• **Distance**: {best['distance_km']} km from your location",
                f"• **Arrival Date**: {best['arrival_date']}",
                "\nOther nearby mandis:"
            ]
            for m in mandis:
                reply_lines.append(f"- **{m['market']}**: ₹{m['modal_price']}/Q ({m['distance_km']} km away)")
        
        citations = []
        for m in mandis:
            citations.append({
                "source": "Government of India OGD / AGMARKNET",
                "market": m["market"],
                "district": m["district"],
                "state": m["state"],
                "commodity": crop,
                "price": m["modal_price"],
                "arrival_date": m["arrival_date"]
            })

        return {
            "reply": "\n".join(reply_lines),
            "data_source": "Government of India OGD / AGMARKNET",
            "data_status": nearest_data.get("data_status", "cached"),
            "citations": citations,
            "tools_used": ["get_nearest_markets"]
        }

    # 2. Weather queries
    if any(k in msg_lower for k in ["weather", "temperature", "humidity", "rain", "forecast", "warning", "मौसम", "तापमान", "आद्रता", "वर्षा", "हवामान", "पाऊस"]):
        weather = get_current_weather(location=location, lat=lat, lon=lon)
        warnings = get_weather_warnings(district=location)
        
        if lang_code == "hi":
            reply = (
                f"**{location}** के लिए वर्तमान मौसम अवलोकन:\n"
                f"• **तापमान**: {weather['temperature']}°C\n"
                f"• **आद्रता**: {weather['humidity']}%\n"
                f"• **वर्षा**: {weather['rainfall']} मिमी\n"
                f"• **हवा की गति**: {weather['wind_speed_kmh']} किमी/घंटा\n"
            )
            warn_list = warnings.get("warnings", [])
            if warn_list:
                reply += "\n⚠️ **सक्रिय मौसम चेतावनियाँ**:\n"
                for w in warn_list:
                    reply += f"- [{w['severity']}] {w['message']}\n"
            else:
                reply += "\n✅ वर्तमान में कोई प्रतिकूल मौसम चेतावनी सक्रिय नहीं है।"
        elif lang_code == "mr":
            reply = (
                f"**{location}** साठी सद्य हवामान माहिती:\n"
                f"• **तापमान**: {weather['temperature']}°C\n"
                f"• **आद्रता**: {weather['humidity']}%\n"
                f"• **पाऊस**: {weather['rainfall']} मिमी\n"
                f"• **वाऱ्याचा वेग**: {weather['wind_speed_kmh']} किमी/तास\n"
            )
            warn_list = warnings.get("warnings", [])
            if warn_list:
                reply += "\n⚠️ **सक्रिय हवामान इशारे**:\n"
                for w in warn_list:
                    reply += f"- [{w['severity']}] {w['message']}\n"
            else:
                reply += "\n✅ सध्या कोणतीही हवामान धोक्याची सूचना नाही."
        else:
            reply = (
                f"Current weather observation for **{location}**:\n"
                f"• **Temperature**: {weather['temperature']}°C\n"
                f"• **Humidity**: {weather['humidity']}%\n"
                f"• **Rainfall**: {weather['rainfall']} mm\n"
                f"• **Wind Speed**: {weather['wind_speed_kmh']} km/h\n"
            )
            warn_list = warnings.get("warnings", [])
            if warn_list:
                reply += "\n⚠️ **Active Weather Warnings**:\n"
                for w in warn_list:
                    reply += f"- [{w['severity']}] {w['message']}\n"
            else:
                reply += "\n✅ No adverse weather warnings currently active."

        return {
            "reply": reply,
            "data_source": weather.get("source", "India Meteorological Department"),
            "data_status": weather.get("data_status", "live"),
            "citations": [{
                "source": weather.get("source"),
                "location": location,
                "temperature": weather["temperature"],
                "rainfall": weather["rainfall"],
                "timestamp": weather.get("timestamp")
            }],
            "tools_used": ["get_current_weather", "get_weather_warnings"]
        }

    # 3. Price prediction / future trend queries
    if any(k in msg_lower for k in ["increase", "future", "predict", "next week", "forecast price", "trend", "will price", "बढ़ेगा", "बढ़ेंगे", "भविष्य", "अंदाज", "वाढतील", "भाव"]):
        pred = predict_commodity_price(commodity=crop, district=location, horizon_days=7)
        
        if pred.get("status") == "insufficient_historical_data":
            if lang_code == "hi":
                reply = f"**{crop_disp}** के लिए मूल्य पूर्वानुमान उत्पन्न करने में असमर्थ: सरकारी बाज़ार कैश में अपर्याप्त ऐतिहासिक डेटा।"
            elif lang_code == "mr":
                reply = f"**{crop_disp}** साठी किमतीचा अंदाज लावता आला नाही: सरकारी बाजार डेटामध्ये अपुरी माहिती आहे."
            else:
                reply = f"Unable to generate price prediction for **{crop_disp}**: Insufficient historical data in government market cache."
            return {
                "reply": reply,
                "data_source": "Mandi Mirror Prediction Engine",
                "citations": [],
                "tools_used": ["predict_commodity_price"]
            }
            
        if lang_code == "hi":
            reply = (
                f"📊 **{crop_disp} के लिए मूल्य पूर्वानुमान** (7-दिन की अवधि):\n"
                f"• **वर्तमान मॉडल मूल्य**: ₹{pred['current_modal_price']} / क्विंटल\n"
                f"• **अनुमानित मूल्य**: ₹{pred['predicted_price']} / क्विंटल\n"
                f"• **अनुमानित सीमा**: ₹{pred['price_range']['min']} - ₹{pred['price_range']['max']}\n"
                f"• **विश्वासनीयता स्कोर**: {pred['confidence_percentage']}%\n"
                f"• **मॉडल**: {pred['model']}\n"
                f"\n*नोट: यह पूर्वानुमान ऐतिहासिक रिकॉर्ड और IMD मौसम कारकों पर आधारित एक सांख्यिकी मॉडल अनुमान है।*"
            )
        elif lang_code == "mr":
            reply = (
                f"📊 **{crop_disp} साठी किमतीचा अंदाज** (७ दिवसांचा कालावधी):\n"
                f"• **सध्याचा क्विंटल दर**: ₹{pred['current_modal_price']} / क्विंटल\n"
                f"• **अंदाजित दर**: ₹{pred['predicted_price']} / क्विंटल\n"
                f"• **अंदाजित श्रेणी**: ₹{pred['price_range']['min']} - ₹{pred['price_range']['max']}\n"
                f"• **विश्वासार्हता स्कोअर**: {pred['confidence_percentage']}%\n"
                f"• **मॉडेल**: {pred['model']}\n"
                f"\n*टीप: हा अंदाज ऐतिहासिक नोंदी आणि IMD हवामान घटकांवर आधारित सांख्यिकी मॉडेल अंदाज आहे.*"
            )
        else:
            reply = (
                f"📊 **Price Forecast for {crop_disp}** (7-Day Horizon):\n"
                f"• **Current Modal Price**: ₹{pred['current_modal_price']} / Quintal\n"
                f"• **Predicted Price**: ₹{pred['predicted_price']} / Quintal\n"
                f"• **Expected Range**: ₹{pred['price_range']['min']} - ₹{pred['price_range']['max']}\n"
                f"• **Confidence Score**: {pred['confidence_percentage']}%\n"
                f"• **Model**: {pred['model']}\n"
                f"\n*Note: This forecast is a statistical model estimate based on historical records and IMD weather factors.*"
            )
        
        return {
            "reply": reply,
            "data_source": "Mandi Mirror Prediction Engine (Statistical Baseline + IMD Weather)",
            "data_status": pred.get("data_status", "cached"),
            "citations": [{
                "source": "Agmarknet Historical + IMD Weather Model",
                "commodity": crop,
                "current_price": pred["current_modal_price"],
                "predicted_price": pred["predicted_price"],
                "timestamp": pred["data_timestamp"]
            }],
            "tools_used": ["predict_commodity_price", "get_market_prices", "get_current_weather"]
        }

    # 4. Standard price lookup query
    prices_data = get_market_prices(commodity=crop, district=location, limit=5)
    records = prices_data.get("records", [])
    
    if not records:
        # Fallback without district filter
        prices_data = get_market_prices(commodity=crop, limit=5)
        records = prices_data.get("records", [])
        
    if not records:
        if lang_code == "hi":
            reply = f"**{crop_disp}** के लिए सरकारी बाज़ार डेटा वर्तमान में उपलब्ध नहीं है।"
        elif lang_code == "mr":
            reply = f"**{crop_disp}** साठी सरकारी बाजार माहिती सध्या उपलब्ध नाही."
        else:
            reply = f"Government market data for **{crop_disp}** is currently unavailable."
        return {
            "reply": reply,
            "data_source": "Government of India OGD / AGMARKNET",
            "data_status": "unavailable",
            "citations": [],
            "tools_used": ["get_market_prices"]
        }

    top = records[0]
    if lang_code == "hi":
        reply_lines = [
            f"**{top['market']}** ({top['state']}) में **{crop_disp}** का वास्तविक बाज़ार भाव:",
            f"• **मॉडल मूल्य**: ₹{top['modal_price']} / क्विंटल",
            f"• **मूल्य सीमा**: ₹{top['min_price']} - ₹{top['max_price']}",
            f"• **आवक तिथि**: {top['arrival_date']}",
            f"• **किस्म (Variety)**: {top['variety']}"
        ]
    elif lang_code == "mr":
        reply_lines = [
            f"**{top['market']}** ({top['state']}) मध्ये **{crop_disp}** चा बाजारातील चालू भाव:",
            f"• **क्विंटल दर (Modal Price)**: ₹{top['modal_price']} / क्विंटल",
            f"• **दर श्रेणी (Price Range)**: ₹{top['min_price']} - ₹{top['max_price']}",
            f"• **आवक तारीख**: {top['arrival_date']}",
            f"• **प्रकार (Variety)**: {top['variety']}"
        ]
    else:
        reply_lines = [
            f"Real Market Price for **{crop_disp}** in **{top['market']}** ({top['state']}):",
            f"• **Modal Price**: ₹{top['modal_price']} / Quintal",
            f"• **Price Range**: ₹{top['min_price']} - ₹{top['max_price']}",
            f"• **Arrival Date**: {top['arrival_date']}",
            f"• **Variety**: {top['variety']}"
        ]
    
    citations = [{
        "source": "Government of India OGD / AGMARKNET",
        "market": top["market"],
        "district": top["district"],
        "state": top["state"],
        "commodity": crop,
        "price": top["modal_price"],
        "arrival_date": top["arrival_date"]
    }]

    return {
        "reply": "\n".join(reply_lines),
        "data_source": "Government of India OGD / AGMARKNET",
        "data_status": prices_data.get("data_status", "cached"),
        "citations": citations,
        "tools_used": ["get_market_prices"]
    }
