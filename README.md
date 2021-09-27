# Unimore-Bot

Bot che permette di prenotare l'aula in modo programmatico.

## Prequisiti

### Node.js:
Node.js è un runtime system open source, compatibile con MacOS, linux e windows, per maggiori informazioni 
visitare questo [link](https://it.wikipedia.org/wiki/Node.js).  
Per installare Node.js sulla propria macchina si può procedere scaricando il pacchetto dal sito ufficiale ([link](https://nodejs.org/en/))
oppure tramite NVM(Node Version Manager), al seguente [link](https://github.com/nvm-sh/nvm#installing-and-updating).  

> **N.B**: si consiglia di utilizzare la versione 15.14.0 di Node.js sulla quale è stata sviluppato e testato l'applicativo, 
> e di conseguenza di utilizzare NVM per l'installazione

### Requisiti della macchina
Non sono richiesti alcuni requisiti di hardware, ma affinché il Bot prenoti in automatico l'aula desiderata è fortemente consigliato un 
dispositivo che rimanga acceso 24/7.  
Si possono utilizzare dei siti di [Hosting](https://it.wikipedia.org/wiki/Hosting) online,
come ad esempio [AWS](https://aws.amazon.com/), [Azure](https://azure.microsoft.com/it-it/), [Heroku](https://www.heroku.com/), etc... 


## Configurazione:

- Clonare la repository di git

- Creare un file chiamato `config.json`

- Compilare il file `config.json`, tenendo conto che al suo interno vi deve essere un [JSON](https://en.wikipedia.org/wiki/JSON).<br/>
  Per prima cosa è fortemente consigliato copiare e incollare la sottostante configurazione.
```json
{
  "BOT_TOKEN": "<BOT TOKEN>",
  "orario": "<ORARIO FORMATO CRON>",
  "viewport": {
    "width": "<WIDTH>",
    "height": "<HEIGHT>"
  },
  "config": {
    "headless": "<MODE>",
    "executablePath": "<EXECUTABLE PATH>",
    "args": "<EXECUTABLE PATH>"
  },
  "users": {
    "user1": {
      "credentials": {
        "username": "<ESSE3 USERNAME>",
        "password": "<ESSE3 PASSWORD>",
        "tg_username": "<TELEGRAM USERNAME>"
      },
      "Sunday": [ ],
      "Monday": [ "<SP>" ],
      "Tuesday": [ "<SP>" ],
      "Wednesday": [ "<SP>" ],
      "Thursday": [ "<SP>" ],
      "Friday": [ "<SP>" ],
      "Saturday": [ ]
    },
    "user2": {
      "credentials": {
        "username": "<ESSE3 USERNAME>",
        "password": "<ESSE3 PASSWORD>",
        "tg_username": "<TELEGRAM USERNAME>"
      },
      "Sunday": [ ],
      "Monday": [ "<SP>" ],
      "Tuesday": [ "<SP>" ],
      "Wednesday": [ "<SP>" ],
      "Thursday": [ "<SP>" ],
      "Friday": [ "<SP>" ],
      "Saturday": [ ]
    }
  }
}
```
### BOT_TOKEN
Nella chiave `BOT_TOKEN` va specificato come **stringa**(tra virgolette) il token del bot da voi creato e sul quale si vuole ricevere gli screenshot della prenotazione.<br/>

> **N.B** la chiave deve essere presente nell'oggetto di configurazione e deve essere specificato un valore corretto

### Orario
Nella chiave `orario` va specificato l'ora e i minuti in cui il bot in automatico andrà ad attivarsi.<br/> Questo dato è una **stringa** ed esiste un formato da rispettare chiamato _Cron time string format_, vi lasciamo un
[link](https://support.acquia.com/hc/en-us/articles/360004224494-Cron-time-string-format) in cui è spiegato l'utilizzo e nel quale vi sono alcuni esempi.  

> **N.B** la chiave deve essere presente nell'oggetto di configurazione e deve essere specificato un valore corretto

### Viewport
La proprietà `viewport` va compilata con **un oggetto** nel quale siano presenti le chiavi `width` e `height`, ciascuna di esse deve essere di **tipo numerico**.  
Tramite `width` (larghezza) e `height` (altezza) si andranno a settare le dimensioni della pagina del browser e di conseguenza dello screenshot della prenotazione.
 
> **N.B** la chiave deve essere presente nell'oggetto di configurazione e deve essere specificato un valore corretto

### Config
La chiave `config` va compilata come **oggetto**.<br/>
Può essere lasciata come oggetto vuoto `{}` in tal caso si userrano le configurazioni di default.<br/>
L'unica chiave che consigliamo di specificare è `headless` che assume valori **booleani** (`true` o `false`) e determina la apertura programmatica di un browser in modalità background o meno;<br/> 
La configurazione consigliata per la chiave `config` nel caso in cui si utilizzi un Raspberry py è la seguente:
```json lines 
"config": {
 "headless": true, 
 "executablePath": "/usr/bin/chromium-browser",
 "args": ["--no-sandbox", "--disable-setuid-sandbox"] 
} 
```

> **N.B** la chiave deve essere presente nell'oggetto ma può essere compilata come oggetto vuoto. 
> Per maggiori informazioni sugli argomenti che è possibile passare nella chiave `args` è possibile trovare la documentazione ufficiale in questo [link](https://pptr.dev/#?product=Puppeteer&version=v10.2.0&show=api-class-puppeteer)

### Users
La chiave `users` va compilata come **oggetto**.<br/>
Al suo interno è possibile specificare un numero arbitrario di utenti.<br/>
Il programma prenoterà l'aula per ciascuno degli utenti configurati nel file.<br/>
Ogni utente viene definito da un identificativo non rilevante ai fini dell'esecuzione (`user1`), questo identificativo è anche la chiave che contiene tutte le informazioni di un utente.<br/>
> **N.B** la chiave deve essere presente nell'oggetto di configurazione e deve essere specificato un valore corretto

### Credentials
La chiave `credentials` va compilata come **oggetto**.<br/>
Al suo interno vanno inserite le chiavi:<br/>
`username` il nome utente di ESSE3.<br/>
`password` la password di ESSE3.<br/>
`tg_username` username di telegram per permette al bot di inviarvi un messaggio.<br/>
> **N.B** lo username di telegram va inserito senza mettere la @.

### SP
Ogni aula del nostro dipartimento viene codificata da un codice **sp**.<br/>
I codici corrispondono ad un aula e ad un determinato orario.<br/>
Questo codice viene inserito alla fine dell'url seguendo lo schema sotto riportato:<br/>
(https://presenze.unimore.it/spacemr/#?page=s__prsncdd&sp= (CODICE DA COPIARE))<br/>
  Bisogna inserire questo codice in formato **stringa**.<br/>
  Nel caso nell'arco di una giornata sia necessario prenotare più di un'aula, inserisci i codici come segue:<br/>
  ```json lines 
  "Monday": ["1", "2"]
  ```
> **N.B** nel caso un giorno non si voglia prenotare nessuna aula, lasciare il campo `sp` vuoto.

## Avvio del bot

### Installazione dei node modules
 Per installare i node modules scrivere il comando `npm i`

> **N.B** Assicurarsi di installare il modulo **pm2** globalmente tramite il comando `npm i -g pm2`. 

## Green pass (facoltativo)
 Nella cartella `photos` è possibile inserire una foto in formato **jpeg** del proprio green pass.<br/>

 Il bot di telegram provvederà a inviarlo assieme allo screenshot della prenotazione.<br/>

 Salvare la foto come segue: `pass-(tg_username).jpeg`.<br/>

> **N.B** questo punto è facoltativo e non inciderà sull'esecuzione del programma.

### Avvio e terminazione del bot con pm2
Per avviare il bot usare il comando `npm start`

 Per stoppare il bot avviato con _pm2_ utilizzare il comando da terminale `npm stop`

### Avvio del bot in modalità _development_
Per avviare il bot in modalità _development_ utilizzare il comando da terminale `npm dev`.<br/>Questa modalità vi permetterà di avviare una sola volta il bot, 
il quale al termine dei processi si stopperà da solo
