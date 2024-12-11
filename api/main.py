from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

origins = ["http://localhost","http://localhost:8000"]  
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


MODEL = tf.keras.models.load_model("trained_model")
CLASS_NAMES = ['Cescospora Leaf Spot', 'Golden Mosaic', 'Healthy Leaf'] 

@app.get("/ping")
async def ping():
    return {"message": "aaa"}

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        image_resized = np.array(Image.fromarray(image).resize((224, 224)))
        image_batch = np.expand_dims(image_resized, 0)

        prediction = MODEL.predict(image_batch)
        predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
        confidence = float(np.max(prediction[0]))

        return {"class": predicted_class, "confidence": confidence}
    except Exception as e:
        print(f"Error in /predict: {str(e)}")
        return {"error": "Failed to process the image"}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8001)