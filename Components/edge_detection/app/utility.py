def preprocess(image_url):
    from src.src import simple_edge_detection, cv2
    image = cv2.imread(image_url, 0)
    img = simple_edge_detection(image)
    cv2.imwrite('edge_detected.png', img) 
    