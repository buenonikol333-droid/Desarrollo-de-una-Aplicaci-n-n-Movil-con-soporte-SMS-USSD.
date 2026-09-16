from app import create_app

app = create_app()

if __name__ == "__main__":
    # host 0.0.0.0 para que el emulador de Android (10.0.2.2) pueda alcanzarlo
    app.run(host="0.0.0.0", port=5000, debug=True)
