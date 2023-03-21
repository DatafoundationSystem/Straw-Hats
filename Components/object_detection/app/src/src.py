import cv2 
import numpy as np 
# import matplotlib.pyplot as plt

def simple_object_detection(image): 
   img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
   img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


   # Use minSize because for not
   # bothering with extra-small
   # dots that would look like STOP signs
   stop_data = cv2.CascadeClassifier('stop_data.xml')

   found = stop_data.detectMultiScale(img_gray,
                           minSize =(20, 20))

   # Don't do anything if there's
   # no sign
   amount_found = len(found)

   if amount_found != 0:
      
      # There may be more than one
      # sign in the image
      for (x, y, width, height) in found:
         
         # We draw a green rectangle around
         # every recognized sign
         cv2.rectangle(img_rgb, (x, y),
                  (x + height, y + width),
                  (0, 255, 0), 5)

   return img_rgb
