import express from 'express';
import { Parser } from 'icecast-parser';
import axios from 'axios';


(() => {

    const server = express();

    const radioStream = "https://media-ssl.musicradio.com/CapitalChill";

    const fetchIcecastData = (req, res) => {
        
        const radioStation = new Parser({ 
            url: req.query.url ?? radioStream,
            autoUpdate: false
        });

        const dieError = () => {
            res.send({
                currentlyPlaying: false
            })
        }
        
        radioStation.on('metadata', async (metadata) => {

            const songDetails = await getSongDetails(metadata.get("StreamTitle"));

            let data = { currentlyPlaying: metadata.get("StreamTitle") };

            if(songDetails !== false) {
                data = { ...data, ...songDetails };
            }

            res.send(data)
        });


        radioStation.on('error', dieError);
        radioStation.on('empty', dieError);
    };

    const getSongDetails = async (songString) => {
        
        try {

            const { data } = await axios.get(`https://itunes.apple.com/search?term=${songString}&limit=1&entity=song`)

            if(data.resultCount > 0) {
                return {
                    cover: data.results[0].artworkUrl100,
                    artist: data.results[0].artistName,
                    name: data.results[0].trackName
                };
            }

        } catch (e) {
            console.error(e);
            return false;
        }

    }

    server.get("/", fetchIcecastData);

    server.listen(8080, () => {
        console.log(`Server listening on: http://localhost:8080`);
    })

})();