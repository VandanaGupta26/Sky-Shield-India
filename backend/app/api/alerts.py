"""
Alert Rules, Multilingual Warning System & Notification Engine
"""

from fastapi import APIRouter, Query, Body
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Notifications"])

class AlertRule(BaseModel):
    city: str
    hazard_type: str  # storm, heatwave, wbgt
    threshold_value: float
    channel: str  # browser_push, email, sms, webhook
    recipient: Optional[str] = None

class SubscriptionRequest(BaseModel):
    email: Optional[str] = None
    endpoint: Optional[str] = None
    city: str
    hazard_types: List[str]

# In-memory stores
_RULES: List[dict] = [
    {
        "id": "rule-1",
        "city": "Bhubaneswar",
        "hazard_type": "storm",
        "threshold_value": 80.0,
        "channel": "browser_push",
        "created_at": "2026-10-24T10:00:00Z",
        "status": "ACTIVE"
    },
    {
        "id": "rule-2",
        "city": "Delhi NCR",
        "hazard_type": "wbgt",
        "threshold_value": 32.0,
        "channel": "email",
        "created_at": "2026-10-24T11:30:00Z",
        "status": "ACTIVE"
    }
]

# Multilingual Translations for Emergency Warnings
MULTILINGUAL_ALERTS = {
    "storm_severe": {
        "en": {
            "title": "EMERGENCY: Very Severe Cyclonic Storm Warning",
            "body": "Gale winds up to 135 km/h and torrential rainfall expected in coastal districts. Evacuate low-lying mud houses immediately. Fishermen must stay in harbor.",
            "action": "Move to designated pucca cyclone shelters. Keep emergency battery radio active."
        },
        "hi": {
            "title": "आपातकालीन चेतावनी: अत्यंत गंभीर चक्रवाती तूफान",
            "body": "तटीय जिलों में 135 किमी/घंटे तक की आंधी और भारी मूसलाधार बारिश की संभावना। निचले इलाकों के कच्चे मकान तुरंत खाली करें। मछुआरे समुद्र में न जाएं।",
            "action": "नजदीकी पक्के चक्रवात राहत शिविर में जाएं। आवश्यक दवाएं और टॉर्च पास रखें।"
        },
        "kn": {
            "title": "ತುರ್ತು ಎಚ್ಚರಿಕೆ: ತೀವ್ರ ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆ",
            "body": "ಕರಾವಳಿ ಪ್ರದೇಶಗಳಲ್ಲಿ ಗಂಟೆಗೆ 135 ಕಿ.ಮೀ ವೇಗದಲ್ಲಿ ಬಿರುಗಾಳಿ ಮತ್ತು ಭಾರಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ತಗ್ಗು ಪ್ರದೇಶಗಳ ನಿವಾಸಿಗಳು ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಸ್ಥಳಗಳಿಗೆ ತೆರಳಬೇಕು.",
            "action": "ಸರ್ಕಾರಿ ಚಂಡಮಾರುತ ಆಶ್ರಯ ತಾಣಗಳಿಗೆ ತೆರಳಿ. ತುರ್ತು ಸಹಾಯವಾಣಿ 112 ಗೆ ಕರೆ ಮಾಡಿ."
        },
        "ta": {
            "title": "அவசர எச்சரிக்கை: தீவிர புயல் முன்னெச்சரிக்கை",
            "body": "கடலோர மாவட்டங்களில் மணிக்கு 135 கி.மீ வேகத்தில் பலத்த காற்று மற்றும் மிக பலத்த மழை பெய்யக்கூடும். தாழ்வான பகுதி மக்கள் பாதுகாப்பான இடங்களுக்கு செல்லவும்.",
            "action": "புயல் பாதுகாப்பு மையங்களுக்கு உடனடியாக செல்லவும். அவசர உதவி எண் 112-ஐ தொடர்பு கொள்ளவும்."
        },
        "te": {
            "title": "అత్యవసర హెచ్చరిక: తీవ్ర తుఫాను ప్రమాద సూచన",
            "body": "తీరప్రాంత జిల్లాల్లో గంటకు 135 కి.మీ వేగంతో బలమైన ఈదురు గాలులు మరియు భారీ వర్షాలు కురిసే అవకాశం ఉంది. లోతట్టు ప్రాంత ప్రజలు వెంటనే సురక్షిత ప్రాంతాలకు వెళ్లాలి.",
            "action": "తుఫాను పునరావాస కేంద్రాలకు చేరుకోండి. అత్యవసర సహాయం కొరకు 112 కాల్ చేయండి."
        }
    },
    "heatwave_extreme": {
        "en": {
            "title": "RED ALERT: Extreme Heatwave & High WBGT",
            "body": "Wet-Bulb Globe Temperature has crossed 32.5°C with air temperatures exceeding 44°C. Severe risk of exertional heat stroke and hyperthermia.",
            "action": "Suspend outdoor manual work between 11:00 AM and 4:30 PM. Drink electrolytes frequently."
        },
        "hi": {
            "title": "रेड अलर्ट: भीषण लू (हीटवेव) और जानलेवा गर्मी",
            "body": "डब्ल्यूबीजीटी तापमान 32.5 डिग्री सेल्सियस पार और अधिकतम तापमान 44 डिग्री से अधिक। हीट स्ट्रोक और डिहाइड्रेशन का गंभीर खतरा।",
            "action": "दोपहर 11:00 से शाम 4:30 बजे तक बाहर मजदूरी व खेलकूद बंद रखें। ओआरएस और नींबू पानी का सेवन करें।"
        },
        "kn": {
            "title": "ರೆಡ್ ಅಲರ್ಟ್: ತೀವ್ರ ಬಿಸಿಗಾಳಿ ಎಚ್ಚರಿಕೆ",
            "body": "WBGT ತಾಪಮಾನವು 32.5°C ಮೀರಿದ್ದು, ತೀವ್ರ ಶಾಖಾಘಾತದ (Heat Stroke) ಸಾಧ್ಯತೆ ಇದೆ.",
            "action": "ಬೆಳಿಗ್ಗೆ 11:00 ರಿಂದ ಸಂಜೆ 4:30 ರವರೆಗೆ ಹೊರಗಿನ ಕೆಲಸಗಳನ್ನು ನಿಲ್ಲಿಸಿ. ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ."
        },
        "ta": {
            "title": "சிவப்பு எச்சரிக்கை: கடுமையான வெப்ப அலை முன்னெச்சரிக்கை",
            "body": "WBGT வெப்பநிலை 32.5°C ஐத் தாண்டியுள்ளது. வெயில் கொடுமையால் மயக்கம் மற்றும் வெப்ப பக்கவாதம் ஏற்பட வாய்ப்புள்ளது.",
            "action": "முற்பகல் 11 முதல் மாலை 4:30 மணி வரை வெளியில் செல்வதை தவிர்க்கவும். அதிக அளவில் நீர் அருந்தவும்."
        },
        "te": {
            "title": "రెడ్ అలర్ట్: తీవ్ర వడగాల్పుల తీవ్రత హెచ్చరిక",
            "body": "WBGT ఉష్ణోగ్రత 32.5°C దాటింది. వడదెబ్బ తగిలే తీవ్ర ప్రమాదం ఉంది.",
            "action": "ఉదయం 11:00 నుండి సాయంత్రం 4:30 వరకు బయట పనులను నిలిపివేయండి. నిరంతరం ద్రవాహారం తీసుకోండి."
        }
    }
}

ALERT_HISTORY = [
    {
        "id": "alt-01",
        "timestamp": "2026-10-24 16:30 IST",
        "hazard": "Storm",
        "severity": "CRITICAL",
        "region": "Odisha & North Andhra Coast",
        "headline": "Red Warning: Cyclonic Storm AS-01 Landfall in ~36h",
        "color": "#EF4444"
    },
    {
        "id": "alt-02",
        "timestamp": "2026-10-24 14:15 IST",
        "hazard": "Heatwave",
        "severity": "HIGH",
        "region": "Vidarbha (Nagpur) & Western Rajasthan",
        "headline": "Severe Heatwave: Temperatures reaching 44.5°C (Departure +6.8°C)",
        "color": "#F97316"
    },
    {
        "id": "alt-03",
        "timestamp": "2026-10-24 12:00 IST",
        "hazard": "WBGT",
        "severity": "EXTREME",
        "region": "Coastal West Bengal & Kolkata",
        "headline": "High Humidity WBGT Exceeds 32.8°C — Mandatory Industrial Rest Cycles",
        "color": "#EF4444"
    },
    {
        "id": "alt-04",
        "timestamp": "2026-10-24 09:45 IST",
        "hazard": "Lightning",
        "severity": "CAUTION",
        "region": "Chhota Nagpur Plateau & South Bihar",
        "headline": "Thundersquall & Frequent Cloud-to-Ground Lightning Strikes",
        "color": "#F59E0B"
    }
]

@router.get("/active")
async def get_active_alerts():
    """
    Returns active alerts list and top priority warning banner data.
    """
    return {
        "top_banner_warning": {
            "id": "BANNER-AS01",
            "level": "CRITICAL",
            "badge": "IMD RED EMERGENCY",
            "title": "Very Severe Cyclonic Storm (AS-01) Approaching Odisha Coast",
            "details": "Wind gusts exceeding 135 km/h. High tidal surges of 2.4m projected at landfall near Puri. Red alert enforced.",
            "color": "#EF4444"
        },
        "active_alerts": ALERT_HISTORY
    }

@router.get("/multilingual")
async def get_multilingual_alert(
    hazard: str = Query("storm_severe", description="Hazard type: storm_severe, heatwave_extreme"),
    lang: str = Query("en", description="Language code: en, hi, kn, ta, te")
):
    """
    Returns emergency alert text formatted in English, Hindi, Kannada, Tamil, or Telugu.
    """
    hazard_dict = MULTILINGUAL_ALERTS.get(hazard, MULTILINGUAL_ALERTS["storm_severe"])
    content = hazard_dict.get(lang, hazard_dict["en"])
    return {
        "hazard": hazard,
        "lang": lang,
        "available_languages": ["en", "hi", "kn", "ta", "te"],
        "content": content
    }

@router.get("/rules")
async def list_alert_rules():
    return _RULES

@router.post("/rules")
async def create_alert_rule(rule: AlertRule):
    new_rule = {
        "id": f"rule-{len(_RULES) + 1}",
        "city": rule.city,
        "hazard_type": rule.hazard_type,
        "threshold_value": rule.threshold_value,
        "channel": rule.channel,
        "recipient": rule.recipient or "Local Browser",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "status": "ACTIVE"
    }
    _RULES.append(new_rule)
    return {"message": "Alert rule created successfully", "rule": new_rule}

@router.post("/subscribe")
async def subscribe_notifications(sub: SubscriptionRequest):
    return {
        "status": "success",
        "message": f"Successfully subscribed {sub.email or 'browser push client'} for {', '.join(sub.hazard_types)} alerts in {sub.city}."
    }

@router.get("/history")
async def get_alert_history(hazard: Optional[str] = None):
    if hazard:
        return [a for a in ALERT_HISTORY if a["hazard"].lower() == hazard.lower()]
    return ALERT_HISTORY
