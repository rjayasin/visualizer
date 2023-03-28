import os

dir_path = "./"  # Replace with the path to your directory
extension = ".mp4"  # Replace with the extension of your files

i = 1
for filename in os.listdir(dir_path):
    if filename.endswith(extension):
        new_filename = str(i) + extension
        os.rename(os.path.join(dir_path, filename), os.path.join(dir_path, new_filename))
        i += 1
