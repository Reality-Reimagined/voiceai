import os
import requests

def call_podcast_endpoint(api_url, script_file_path, output_directory="output"):
    """
    Sends a POST request to the podcast endpoint with the script and
    `main.flac`, `town.flac`, and `country.flac` from the current directory.
    Downloads the generated podcast file based on the API response.

    Args:
        api_url (str): The base API URL (e.g., "https://example.com").
        script_file_path (str): Path to the story script file (required).
        output_directory (str): Directory to save the downloaded podcast file.

    Returns:
        dict: Response JSON from the API, or None if an error occurs.
    """
    url = f"{api_url}/podcast/"

    # Define paths for the required audio files
    main_file_path = "main.flac"
    town_file_path = "town.flac"
    country_file_path = "VoiceforTTS.flac"

    # Ensure files exist in the root directory
    for file_path in [main_file_path, town_file_path, country_file_path]:
        if not os.path.exists(file_path):
            print(f"Error: {file_path} not found in the root directory.")
            return None

    # Prepare the files to send
    files = {
        "script": open(script_file_path, "rb"),
        "main": open(main_file_path, "rb"),
        "town": open(town_file_path, "rb"),
        "country": open(country_file_path, "rb"),
    }

    try:
        # Send the POST request
        response = requests.post(url, files=files)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the response
        response_json = response.json()
        print("Response:", response_json)

        # Fetch the generated file name
        podcast_name = response_json.get("output_file")
        if podcast_name:
            print(f"Downloading podcast: {podcast_name}")

            # Build the download URL and save path
            download_url = f"{api_url}/audio/{podcast_name}"
            save_path = os.path.join(output_directory, podcast_name)

            # Ensure the output directory exists
            os.makedirs(output_directory, exist_ok=True)

            # Download the file
            download_response = requests.get(download_url, stream=True)
            download_response.raise_for_status()  # Raise an exception for HTTP errors

            with open(save_path, "wb") as f:
                for chunk in download_response.iter_content(chunk_size=8192):
                    f.write(chunk)

            print(f"Podcast saved to: {save_path}")
        else:
            print("Error: No output_file returned in the response.")

        return response_json
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None
    finally:
        # Close all opened files
        for file in files.values():
            file.close()

# Example usage
if __name__ == "__main__":
    # Replace with your actual API base URL
    api_base_url = "https://f5-tts-service-157176978845.us-central1.run.app"

    # Required script file
    script_path = "story4.txt"  # Replace with the actual path to your script file

    # Call the endpoint and download the generated podcast
    response = call_podcast_endpoint(api_base_url, script_path)
    print("Final Response:", response)
