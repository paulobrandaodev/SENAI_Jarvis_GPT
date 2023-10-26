let botao = document.querySelector('#microfone');
let input = document.querySelector('input');

const OpenAPIKey  = process.env.OPENAI_API_KEY;
const AzureAPIKey = process.env.AZURE_API_KEY;

// Aqui vamos capturar a fala do usuário
const CapturarFala = () => {

    // Aqui vamos criar um objeto de reconhecimento de fala
    const recognition = new webkitSpeechRecognition();
    recognition.lang = window.navigator.language;
    recognition.interimResults = true;

    botao.addEventListener('mousedown', () => {
        recognition.start();
    });

    botao.addEventListener('mouseup', () => {
        recognition.stop();
        PerguntarAoJarvis(input.value);
    });

    // Aqui vamos capturar o resultado da fala
    recognition.addEventListener('result', (e) => {
        const result = e.results[0][0].transcript;
        input.value = result;
    });

}


const PerguntarAoJarvis = async (pergunta) => {

    let url = 'https://api.openai.com/v1/chat/completions';
    let header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OpenAPIKey}`
    }

    let body = {
        "model": "ft:gpt-3.5-turbo-0613:zeros-e-um::8DDHyrh4",
        "messages": [
          {
            "role": "system",
            "content": "Jarvis é um chatbot pontual e muito simpático que ajuda as pessoas"
          },
          {
            "role": "user",
            "content": pergunta
          }
        ],
        "temperature": 0.7
    }

    let options = {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body)
    }

    fetch(url, options)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        // console.log(data.choices[0].message.content);
        FalarComoJarvis(data.choices[0].message.content);
    });

}


const FalarComoJarvis = (textoParaFala) => {

    const endpoint  = 'https://brazilsouth.tts.speech.microsoft.com/cognitiveservices/v1';

    const requestOptions = {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': AzureAPIKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'curl',
        },
        body: `<speak version='1.0' xml:lang='pt-BR'>
                <voice xml:lang='pt-BR' xml:gender='Male' name='pt-BR-JulioNeural'>
                 ${textoParaFala}
                </voice>
            </speak>`,
    };

    fetch(endpoint, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.arrayBuffer();
            } else {
                throw new Error(`Falha na requisição: ${response.status} - ${response.statusText}`);
            }
        })
        .then(data => {
            const blob = new Blob([data], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);

            const audioElement = new Audio(audioUrl);
            audioElement.play();
            MudarDesignBotao();
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

const AtivarJarvis = () => {

    // Crie uma instância de SpeechRecognition
    const recognition = new webkitSpeechRecognition();

    // Defina configurações para a instância
    recognition.continuous = true; // Permite que ele continue escutando
    recognition.interimResults = false; // Define para true se quiser resultados parciais

    // Inicie o reconhecimento de voz
    recognition.start();

    // Adicione um evento de escuta para lidar com os resultados
    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1]; // Último resultado

        // Verifique o texto reconhecido
        const recognizedText = result[0].transcript;

        // Verifique se a palavra "Jarvis" está no texto
        if (recognizedText.toLowerCase().includes('jarvis')) {
            // Comece a salvar a pergunta quando "Jarvis" é detectado
            let array_pergunta = recognizedText.toLowerCase().split('jarvis');
            array_pergunta = array_pergunta[array_pergunta.length - 1];

            input.value = array_pergunta;
            PerguntarAoJarvis(array_pergunta);
            MudarDesignBotao();
            if(array_pergunta.toLowerCase().includes("trocar tema")){
                TrocarTema();
            }

            // Pare o reconhecimento de voz para economizar recursos
            recognition.stop();
        }
    };

    // Adicione um evento para reiniciar o reconhecimento após um tempo
    recognition.onend = () => {
        setTimeout(() => {
            recognition.start();
        }, 1000); // Espere 1 segundo antes de reiniciar
    };


}
let dark = true;
const TrocarTema = () => {
    dark = !dark
    if(dark)
        document.documentElement.style.setProperty('color-scheme', 'dark');
    else
        document.documentElement.style.setProperty('color-scheme', 'light');
}


const MudarDesignBotao = () => {
    let icon = document.querySelector('.icon');

    icon.classList.toggle('fa-microphone');
    icon.classList.toggle('fa-microphone-slash');

}

AtivarJarvis();
//CapturarFala();


