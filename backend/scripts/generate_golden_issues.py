from __future__ import annotations

import json
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / "tests" / "fixtures" / "golden_issues.json"


def make_issue(index: int, category: str, language: str, text: str, expected_translation: str, severity: float) -> dict:
    return {
        "id": f"fixture-{index:03d}",
        "category": category,
        "language": language,
        "source_channel": "whatsapp",
        "raw_text": text,
        "expected_translation": expected_translation,
        "expected_issue_type": category,
        "expected_severity_score": severity,
    }


def build_fixture() -> list[dict]:
    issues: list[dict] = []
    counter = 1

    road_hindi = [
        ("स्कूल के सामने सड़क टूट गई है, बच्चे रोज गिर रहे हैं।", "The road in front of the school is broken and children are falling every day.", 8.7),
        ("बरसात के बाद मुख्य सड़क पर बड़े गड्ढे हो गए हैं।", "After the rains, the main road has developed large potholes.", 7.5),
        ("गांव को जोड़ने वाली सड़क छह महीने से अधूरी है।", "The road connecting the village has been unfinished for six months.", 6.8),
        ("एम्बुलेंस इस सड़क से नहीं आ पा रही है।", "Ambulances are unable to reach through this road.", 9.1),
        ("वार्ड 14 में डामर पूरी तरह उखड़ गया है।", "In Ward 14 the asphalt has completely peeled away.", 7.9),
    ]
    for repeat in range(4):
        for text, translation, severity in road_hindi:
            issues.append(make_issue(counter, "road", "hi", text, translation, severity - (repeat * 0.1)))
            counter += 1

    water_samples = [
        ("காலை ஐந்து மணிக்கு மட்டும் தண்ணீர் வருகிறது, பிறகு முழு நாள் இல்லை.", "Water comes only at five in the morning and then stops for the whole day.", 7.8, "ta"),
        ("குழாய் நீரில் மண் கலந்திருக்கிறது.", "Mud is mixed in the tap water.", 6.9, "ta"),
        ("ఈ వారం మూడోసారి నీటి సరఫరా పూర్తిగా ఆగిపోయింది.", "This is the third time this week that water supply has stopped completely.", 8.1, "te"),
        ("బోర్‌వెల్ దగ్గర క్యూ చాలా ఎక్కువగా ఉంది.", "The queue near the borewell is very long.", 6.2, "te"),
        ("குடிநீர் தொட்டியை சுத்தம் செய்யவில்லை.", "The drinking water tank has not been cleaned.", 7.0, "ta"),
    ]
    for repeat in range(4):
        for text, translation, severity, language in water_samples:
            issues.append(make_issue(counter, "water", language, text, translation, severity + (repeat * 0.05)))
            counter += 1

    health_samples = [
        ("প্রাথমিক স্বাস্থ্যকেন্দ্রে ডাক্তার সপ্তাহে একদিনও আসেন না।", "The doctor does not come to the primary health centre even once a week.", 8.4, "bn"),
        ("ওষুধের স্টকে জ্বর আর ডায়াবেটিসের ওষুধ নেই।", "Fever and diabetes medicines are out of stock.", 7.7, "bn"),
        ("आरोग्य केंद्रात प्रसूती कक्ष बंद आहे.", "The maternity room at the health centre is closed.", 8.8, "mr"),
        ("रुग्णवाहिका फोन केल्यावरही वेळेवर येत नाही.", "The ambulance does not arrive on time even after calling.", 8.9, "mr"),
        ("बाळांसाठी लसीकरण आजही रद्द झाले.", "Vaccination for children was cancelled again today.", 7.6, "mr"),
    ]
    for repeat in range(3):
        for text, translation, severity, language in health_samples:
            issues.append(make_issue(counter, "health", language, text, translation, severity - (repeat * 0.15)))
            counter += 1

    power_samples = [
        ("बिजली रोज रात में चार घंटे चली जाती है.", "Power goes out every night for four hours.", 7.5, "bho"),
        ("ट्रांसफार्मर जल गइल बा, तीन दिन से अँधेरा बा।", "The transformer has burned and it has been dark for three days.", 8.8, "bho"),
        ("ಪ್ರತಿ ಸಂಜೆ ವೋಲ್ಟೇಜ್ ತುಂಬಾ ಕಡಿಮೆಯಾಗುತ್ತಿದೆ.", "Every evening the voltage drops too low.", 6.9, "kn"),
        ("ಗ್ರಾಮದ ಒಂದು ಭಾಗಕ್ಕೆ ವಿದ್ಯುತ್ ಲೈನ್ ತಲುಪುತ್ತಿಲ್ಲ.", "The electric line is not reaching one part of the village.", 7.8, "kn"),
        ("मीटर बिल गलत आ रहल बा.", "The meter bill is coming incorrectly.", 5.4, "bho"),
    ]
    for repeat in range(3):
        for text, translation, severity, language in power_samples:
            issues.append(make_issue(counter, "power", language, text, translation, severity + (repeat * 0.1)))
            counter += 1

    education_samples = [
        ("શાળામાં ગણિતના શિક્ષક ત્રણ મહિનાથી નથી.", "The school has had no mathematics teacher for three months.", 7.1, "gu"),
        ("ବିଦ୍ୟାଳୟର ଶୌଚାଳୟ ବ୍ୟବହାରଯୋଗ୍ୟ ନୁହେଁ।", "The school toilet is not usable.", 7.4, "or"),
        ("ક્લાસરૂમની છતમાંથી વરસાદ પડે છે.", "Rain leaks through the classroom roof.", 7.8, "gu"),
        ("ସ୍କୁଲରେ ପାଣି ନଥିବାରୁ ଛାତ୍ରମାନେ ଘରକୁ ଫେରୁଛନ୍ତି।", "Students are returning home because the school has no water.", 6.9, "or"),
        ("પાઠ્યપુસ્તક હજુ સુધી મળ્યાં નથી.", "Textbooks have still not been distributed.", 5.9, "gu"),
    ]
    for repeat in range(2):
        for text, translation, severity, language in education_samples:
            issues.append(make_issue(counter, "education", language, text, translation, severity + (repeat * 0.05)))
            counter += 1

    employment_samples = [
        ("मनरेगा के भुगतान तीन महीना से अटका है।", "MGNREGA payment has been stuck for three months.", 7.3, "raj"),
        ("काम तो हुआ लेकिन जॉब कार्ड में एंट्री नहीं है।", "The work was done but there is no entry in the job card.", 6.4, "raj"),
        ("मनरेगा साइट पर मशीन चल रही है, मजदूरों को काम नहीं मिल रहा।", "Machines are operating at the MGNREGA site and labourers are not getting work.", 7.9, "hne"),
        ("रोज़गार शिविर का वादा हुआ था पर कोई सूचना नहीं आई।", "An employment camp was promised but no information arrived.", 5.8, "hne"),
        ("गाँव के युवाओं के लिए स्किल सेंटर बंद पड़ा है।", "The skill centre for village youth is shut.", 6.7, "raj"),
    ]
    for repeat in range(2):
        for text, translation, severity, language in employment_samples:
            issues.append(make_issue(counter, "employment", language, text, translation, severity + (repeat * 0.1)))
            counter += 1

    voice_notes = [
        ("voice-hi-1", "hi", "हमारे मोहल्ले में सीवर उफन रहा है और बदबू बहुत है।", "Sewage is overflowing in our neighbourhood and the stench is severe.", "sanitation", 7.6),
        ("voice-ta-1", "ta", "அரசு மருத்துவமனையில் இன்று மருத்துவர் வரவே இல்லை.", "No doctor came to the government hospital today.", "health", 8.2),
        ("voice-bn-1", "bn", "পানীয় জলের পাইপ ফেটে রাস্তায় নষ্ট হচ্ছে।", "The drinking water pipe has burst and water is being wasted on the road.", "water", 7.4),
        ("voice-mr-1", "mr", "रस्त्यावरील स्ट्रीटलाइट बंद आहेत.", "The streetlights on the road are not working.", "power", 6.8),
        ("voice-bho-1", "bho", "आंगनबाड़ी में पोषण आहार कई दिन से नइखे मिलत।", "Nutrition supplements have not been available at the anganwadi for many days.", "health", 7.1),
    ]
    for voice_id, language, text, translation, category, severity in voice_notes:
        issues.append(
            {
                "id": voice_id,
                "category": category,
                "language": language,
                "source_channel": "voice_note",
                "raw_text": text,
                "expected_translation": translation,
                "expected_issue_type": category,
                "expected_severity_score": severity,
            }
        )

    edge_cases = [
        {"id": "edge-001", "category": "other", "language": "en", "source_channel": "whatsapp", "raw_text": "", "expected_translation": "", "expected_issue_type": "other", "expected_severity_score": 1.0, "edge_case": "empty_message"},
        {"id": "edge-002", "category": "other", "language": "en", "source_channel": "whatsapp", "raw_text": "Hi", "expected_translation": "Hi", "expected_issue_type": "other", "expected_severity_score": 1.0, "edge_case": "very_short_message"},
        {"id": "edge-003", "category": "other", "language": "hi", "source_channel": "whatsapp", "raw_text": "तुम लोग कुछ नहीं करते, बेकार हो।", "expected_translation": "You people do nothing, you are useless.", "expected_issue_type": "other", "expected_severity_score": 2.0, "edge_case": "abusive_content"},
        {"id": "edge-004", "category": "other", "language": "en", "source_channel": "whatsapp", "raw_text": "What is the cricket score today?", "expected_translation": "What is the cricket score today?", "expected_issue_type": "other", "expected_severity_score": 1.0, "edge_case": "irrelevant_content"},
        {"id": "edge-005", "category": "road", "language": "hi", "source_channel": "whatsapp", "raw_text": "स्कूल के सामने सड़क टूट गई है, बच्चे रोज गिर रहे हैं।", "expected_translation": "The road in front of the school is broken and children are falling every day.", "expected_issue_type": "road", "expected_severity_score": 8.7, "edge_case": "duplicate_issue"},
    ]
    issues.extend(edge_cases)

    return issues


def main() -> None:
    issues = build_fixture()
    if len(issues) != 100:
        raise SystemExit(f"Expected 100 fixture issues, got {len(issues)}")
    TARGET.write_text(json.dumps(issues, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {len(issues)} issues to {TARGET}")


if __name__ == "__main__":
    main()

