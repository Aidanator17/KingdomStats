import os

# Get current directory (where the script is run)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Loop through all files in the directory
for filename in os.listdir(current_dir):
    if filename.endswith(".png"):
        original_path = os.path.join(current_dir, filename)

        # Split by underscores
        parts = filename.split("_")
        
        if len(parts) == 3:
            rank = parts[0].lower()
            num = parts[1]
            new_name = f"{rank}_{num}.png"
        else:
            # For radiant or unrated with 'undefined' part
            rank = parts[0].lower()
            new_name = f"{rank}.png"
        
        new_path = os.path.join(current_dir, new_name)
        os.rename(original_path, new_path)
        print(f"Renamed '{filename}' to '{new_name}'")
