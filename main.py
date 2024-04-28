from flask import Flask, render_template, request, jsonify, Response, send_file #pip install flask
from googletrans import Translator # pip install googletrans==3.1.0a0
import os
from docx import Document # pip install python-docx
from PyPDF2 import PdfReader # pip install PyPDF2
from reportlab.lib.pagesizes import letter # pip install reportlab
from reportlab.pdfgen import canvas # pip install reportlab
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from image import remove_and_translate_text
import audio

# run command in terminal:
# python main.py

app = Flask(__name__, static_folder="static", static_url_path="/static")
translator = Translator()

# Extract text from file, function
def file_to_text(file):
    text = ""

    if file.filename.endswith(".pdf"):
        pdf_reader = PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    elif file.filename.endswith(".docx"):
        doc = Document(file)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    elif file.filename.endswith(".txt"):
        text = file.read()
        text = text.decode("utf-8")
    return text


@app.route("/", methods=["GET", "POST"])
def translate_text():
    return render_template("index.html")


# Extract text from file, route
@app.route("/extract", methods=["POST"])
def extract_text():
    if request.method == "POST":
        if "file" in request.files:
            file = request.files["file"]
            if file.filename == "":
                return jsonify({"output": "No file selected"})

            _, file_extension = os.path.splitext(file.filename)

            if file_extension in (".pdf", ".docx", ".txt"):
                extracted_text = file_to_text(file)
                return jsonify(
                    {"extracted_text": extracted_text}
                )
            else:
                return jsonify({"output": "Unsupported file type"})
    else:
        return jsonify({"output": "Error"})


# Translate text, route
@app.route("/translate", methods=["POST"])
def translate():
    if request.method == "POST":
        text = request.form.get("leftext")
        output_lang_code = request.form.get("output_lang")
        input_lang_code = request.form.get("target_lang")
        output = Translator().translate(
            text, src=input_lang_code, dest=output_lang_code
        )
        return jsonify({"output": output.text})
    else:
        return jsonify({"output": "Error"})


# text to PDF, function
def text_to_pdf(text):
    output_pdf_path = "output.pdf"

    c = canvas.Canvas(output_pdf_path, pagesize=letter)
    # c.setFont("Helvetica", 12)
    pdfmetrics.registerFont(TTFont("NotoSans", "Noto_Sans/NotoSans-Regular.ttf"))  # https://www.google.com/get/noto/
    c.setFont("NotoSans", 12)
    lines = text.split("\n")

    for line in lines:
        c.drawString(100, 700, line)
        c.showPage()

    c.save()

    return output_pdf_path


# text to PDF, route
@app.route("/convert_to_pdf", methods=["POST"])
def convert_to_pdf():
    if request.method == "POST":
        text = request.form.get("output-text")

        if text:
            pdf_path = text_to_pdf(text)
            return jsonify({"pdf_path": pdf_path})

    return jsonify({"output": "Error"})


# download the generated PDF, route
@app.route("/download_pdf", methods=["GET"])
def download_pdf():
    pdf_path = "output.pdf"
    with open(pdf_path, "rb") as pdf_file:
        pdf_data = pdf_file.read()

    response = Response(pdf_data, content_type="application/pdf")
    response.headers["Content-Disposition"] = "attachment; filename=output.pdf"

    return response

# Transalate image, route
@app.route("/process_image", methods=["POST"])
def process_image():
    if request.method == "POST":

        if "file" in request.files:

            file = request.files["file"]
            if file.filename == "":
               
                return jsonify({"output": "No file selected"})

            _, file_extension = os.path.splitext(file.filename)

            if file_extension.lower() in (".jpg", ".jpeg", ".png"):

                output_image = remove_and_translate_text(file)

                if file_extension.lower() in (".jpg", ".jpeg"):
                    content_type = "image/jpeg"
                elif file_extension.lower() == ".png":
                    content_type = "image/png"
                else:
                    content_type = "application/octet-stream"

                response = Response(output_image, content_type=content_type)
                
                return response
            else:
                return jsonify({"output": "Unsupported image format"})
        else:
            return jsonify({"output": "Error"})
    else:
        return jsonify({"output": "Error"})

#audio
@app.route("/translate_audio", methods=["POST"])
def process_audio():
    audio_file = request.files.get("audioPlayer")
    input_language = request.form.get("input_lang", default="auto")
    target_language = request.form.get("target_lang")

    print("Received audio file:", audio_file)
    print("Input language:", input_language)
    print("Target language:", target_language)

    if not audio_file:
        print("Error: No audio file provided")
        return jsonify({"error": "Missing audio file"}), 400

    result = audio.translate_audio(audio_file, input_language, target_language)
    print("Translation result:", result)

    if result["success"]:
        return send_file(
            result["audio"],
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="translated_audio.mp3"
        )
    else:
        print("Error during translation:", result["error"])
        return jsonify({"error": result["error"]}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8001)