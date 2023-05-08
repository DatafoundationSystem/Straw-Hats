import sys
from minio import Minio
from minio.error import S3Error

def preprocess():
    from src.src import sharpening_image, cv2
    image = cv2.imread("ip.jpg")
    img = sharpening_image(image)
    cv2.imwrite("op.jpg", img) 
    
if __name__ == '__main__':
    
    client = Minio(
        # "play.min.io",
        "127.0.0.1:9000",
        secure=False,
        access_key = 'RzRZkFomebQ1QHLU',
        secret_key = 'm2593hGdtyAHRdmqcTu8erPUf2wSn0bx'
    )

    image_url = sys.argv[1]
    print(image_url)
    flag = False
    while not flag:
        try:
            client.fget_object(
                "uploads", image_url, "ip.jpg",
            )
            flag = True
        except:
            flag = False

    print("Object Fetched sucessfully")
    new_img=sys.argv[2]
    print(new_img)
    preprocess()
    print("preprocessed")
    client.fput_object(
        "uploads", new_img, "op.jpg",
    )
    print("Image Uploaded sucessfully")
