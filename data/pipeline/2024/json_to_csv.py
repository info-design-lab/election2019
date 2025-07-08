# import pandas as pd

# # Read the CSV file
# df = pd.read_csv("data/pipeline/2024/2024.csv")

# # Convert to JSON
# json_data = df.to_json(orient="records", indent=4)

# # Save to a file
# with open("india2024.json", "w") as json_file:
#     json_file.write(json_data)

# print("CSV successfully converted to JSON!")

# import pandas as pd

# # Read the CSV file
# df = pd.read_csv("data/pipeline/2024/2024.csv")

# # Convert all string values to uppercase
# df = df.applymap(lambda x: x.upper() if isinstance(x, str) else x)

# # Save the modified data back to CSV
# df.to_csv("output1.csv", index=False)

# print("CSV data converted to uppercase successfully!")

# import pandas as pd

# # Load the CSV file
# df = pd.read_csv("data/pipeline/2024/2024.csv")

# # Update the "Rank" column where "Name" is "NOTA"
# df.loc[df["Name"] == "NOTA", "Rank"] = -1

# # Save the updated CSV file
# df.to_csv("2024_updated.csv", index=False)

# print('Updated "Rank" for NOTA successfully!')


import json

# Load india2024.json
with open("data/pipeline/2024/2024.csv", "r", encoding="utf-8") as file:
    data_2024 = json.load(file)

# Initialize transformed data format
transformed_data = {"S01": {}}

# Convert the list format into the dictionary format
for entry in data_2024:
    # Check if "Constituency-code" is valid (not None)
    if entry.get("Constituency-code") is not None:
        try:
            constituency_code = int(entry["Constituency-code"])  # Convert to int
        except ValueError:
            print(f"Skipping entry due to invalid Constituency-code: {entry}")
            continue  # Skip invalid data

        transformed_data["S01"][constituency_code] = {
            "State": entry["State"],
            "Constituency": entry["Constituency"],
            "Party": entry["Party"],
            "Front": "Others"  # Assigning "Others" as no "Front" data is available
        }
    else:
        print(f"Skipping entry with missing Constituency-code: {entry}")

# Save the transformed data as india2024_converted.json
with open("india2024_pp.json", "w", encoding="utf-8") as file:
    json.dump(transformed_data, file, indent=4)

print("Conversion successful! Data saved in india2024_converted.json")







