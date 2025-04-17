import sys
import json
from deepface import DeepFace

def detect_emotion(image_path):
    try:
        result = DeepFace.analyze(image_path, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']
        return {"emotion": emotion}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    image_path = sys.argv[1]
    result = detect_emotion(image_path)
    print(json.dumps(result))