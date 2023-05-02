import sys
from minio import Minio
from minio.error import S3Error

def preprocess(image_url):
    from src.src import simple_edge_detection, cv2
    image = cv2.imread(image_url, 0)
    img = simple_edge_detection(image)
    cv2.imwrite('edge_detected.jpg', img) 
    
if __name__ == '__main__':
    
    client = Minio(
        # "play.min.io",
        "127.0.0.1:9000",
        secure=False,
        access_key="EitPADwoAUvkzhs6",
        secret_key="g82ahUIxSAhtIJeCoLWTV1YrONFpjTop",
    )

    image_url = sys.argv[1]

    client.fget_object(
        "uploads", image_url, image_url,
    )

    preprocess( image_url )

    new_img="temp.jpg"
    client.fput_object(
        "uploads", new_img, "edge_detected.jpg",
    )