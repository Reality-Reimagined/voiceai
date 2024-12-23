import requests
import os

def synthesize_text(api_url, text, output_directory="output"):
    """
    Sends a POST request to the synthesize endpoint with the given text and downloads the resulting audio file.

    Args:
        api_url (str): The base API URL (e.g., "https://example.com").
        text (str): The text to synthesize into audio.
        output_directory (str): Directory to save the synthesized audio file.

    Returns:
        dict: Response JSON from the API, or None if an error occurs.
    """
    url = f"{api_url}/synthesize/"

    # Prepare the JSON payload
    payload = {"text": text}
    headers = {"Content-Type": "application/json"}

    try:
        # Send the POST request
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the response
        response_json = response.json()
        print("Response:", response_json)

        # Fetch the generated file name
        audio_file = response_json.get("output_file")
        if audio_file:
            print(f"Downloading audio file: {audio_file}")

            # Build the download URL and save path
            download_url = f"{api_url}/audio/{audio_file}"
            save_path = os.path.join(output_directory, audio_file)

            # Ensure the output directory exists
            os.makedirs(output_directory, exist_ok=True)

            # Download the file
            download_response = requests.get(download_url, stream=True)
            download_response.raise_for_status()  # Raise an exception for HTTP errors

            with open(save_path, "wb") as f:
                for chunk in download_response.iter_content(chunk_size=8192):
                    f.write(chunk)

            print(f"Audio file saved to: {save_path}")
        else:
            print("Error: No output_file returned in the response.")

        return response_json
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# Example usage
if __name__ == "__main__":
    # Replace with your actual API base URL
    api_base_url = "https://f5-tts-service-157176978845.us-central1.run.app"

    # Text to synthesize
    text_to_synthesize = "Hello, world!"  # Replace with the text you want to synthesize

    # Call the synthesize endpoint and download the audio file
    response = synthesize_text(api_base_url, text_to_synthesize)
    print("Final Response:", response)
