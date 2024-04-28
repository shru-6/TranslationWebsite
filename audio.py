import speech_recognition as sr # pip install SpeechRecognition
from googletrans import Translator
from gtts import gTTS # pip install gTTS
from io import BytesIO

# only works for .wav audio files
def translate_audio(audio_stream, input_language='en-US', target_language='es'):
    # Initialize speech recognizer and translator
    recognizer = sr.Recognizer()
    translator = Translator()

    print("Initialized recognizer and translator.")

    # Open the audio file and convert speech to text
    with sr.AudioFile(audio_stream) as source:
        audio_data = recognizer.record(source)
        print("Audio data recorded.")

    try:
        # Recognize speech using Google's free API
        text = recognizer.recognize_google(audio_data, language=input_language)
        print(f"Recognized text: {text}")

        # Translate the recognized text to the target language
        translated_text = translator.translate(text, dest=target_language).text
        print(f"Translated text: {translated_text}")

        # Convert translated text back to speech in the target language
        tts = gTTS(text=translated_text, lang=target_language)
        output_audio = BytesIO()
        tts.write_to_fp(output_audio)
        output_audio.seek(0)

        print("Converted translated text back to speech.")
        return {"success": True, "audio": output_audio}
    except Exception as e:
        print("An error occurred:", str(e))
        # Return error details if the process fails
        return {"success": False, "error": str(e)}