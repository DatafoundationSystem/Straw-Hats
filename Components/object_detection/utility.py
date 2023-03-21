def preprocess(image_url):
    from src.src import simple_object_detection, cv2
    image = cv2.imread(image_url, 0)
    img = simple_object_detection(image)
    cv2.imwrite('edge_detected.png', img) 
    