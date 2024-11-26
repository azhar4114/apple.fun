import os
from PIL import Image

# List of background images to process differently
background_images = {
    "board1.jpeg", "sky1.jpeg", "play1.jpeg", "play2.jpeg", "class2.jpeg", "class3.jpeg", 
    "play3.jpeg", "class1.jpeg", "rainbow2.jpeg", "Winter.jpeg", "rainbow1.jpeg", 
    "space1.jpeg", "baloon1.jpeg", "baloon4.jpeg", "board3.jpeg", "board4.jpeg", 
    "flowers1.jpeg", "flowers2.jpeg", "flowers3.jpeg", "flowers4.jpeg", "sky2.jpeg", 
    "sky3.jpeg", "sky4.jpeg", "fruits1.jpeg", "fruits2.jpeg", "vege1.jpeg", "vege2.jpeg", 
    "solarbg.jpeg", "solarbg1.jpeg", "solarbg2.jpeg", "Spring.jpeg", "baloon2.jpeg", 
    "baloon3.jpeg"
}

def reduce_images_in_folder(input_folder, output_folder, default_quality=30, max_width=800):
    """
    Reduces the quality of all images in a folder and saves them to another folder.
    Handles specific images differently based on predefined criteria.

    :param input_folder: Path to the folder containing input images.
    :param output_folder: Path to the folder to save the optimized images.
    :param default_quality: Compression quality (1-100) for non-background images.
    :param max_width: Resize non-background images if their width exceeds this value.
    """
    # Ensure output folder exists
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Process each image in the input folder
    for filename in os.listdir(input_folder):
        input_image_path = os.path.join(input_folder, filename)
        
        # Ensure it's an image file
        if not os.path.isfile(input_image_path) or not filename.lower().endswith(('png', 'jpg', 'jpeg', 'webp')):
            continue
        
        try:
            with Image.open(input_image_path) as img:
                # Check if the image is a background image
                is_background = filename in background_images

                # Background images: retain size, set quality to 60
                if is_background:
                    quality = 60
                else:
                    quality = default_quality
                    # Resize if max_width is specified and not a background image
                    if max_width and img.width > max_width:
                        aspect_ratio = img.height / img.width
                        new_width = max_width
                        new_height = int(aspect_ratio * new_width)
                        img = img.resize((new_width, new_height), Image.ANTIALIAS)

                # Determine output path and save image
                output_image_path = os.path.join(output_folder, filename)
                img_format = "PNG" if filename.lower().endswith("png") else "JPEG"
                img.save(output_image_path, format=img_format, quality=quality, optimize=True)
                
                print(f"Processed: {filename} (Background: {is_background})")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

# Example usage
input_folder = "./"
output_folder = "./images"
reduce_images_in_folder(input_folder, output_folder, default_quality=20, max_width=300)
