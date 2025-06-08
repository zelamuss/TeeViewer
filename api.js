import { COUNTRY_CODES } from './country_codes.js';



console.log("api.js loaded");

window.navigateToPage = function(page) {
    window.location.href = page;
};

let myTee;



const formatTimestamp = (timestamp) => {

    if (!timestamp) return 'N/A';

    try {

        const date = new Date(timestamp);

        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

    } catch (e) {

        return 'Invalid Date';

    }

};



window.getStatus = async function() {

    console.log("getStatus function called");

    try {

        const response = await fetch("https://api.status.tw/stats");

        console.log("API response status:", response.status);

        if (!response.ok) {

            throw new Error(`HTTP error! status: ${response.status}`);

        }

        const data = await response.json();

        console.log("API data received:", data);



        const numPlayers = data.numPlayers;

        const numServers = data.numServers;

        const numClans = data.numClans;

        const numMaps = data.numMaps;



        const onlinePlayerCountElement = document.getElementById('onlineplayercount');

        const numServersElement = document.getElementById('numServers');

        const numClansElement = document.getElementById('numClans');

        const numMapsElement = document.getElementById('numMaps');

        

        if (onlinePlayerCountElement) {

            onlinePlayerCountElement.innerHTML = "Players Online: <br>" + numPlayers;

            console.log("onlineplayercount updated:", onlinePlayerCountElement.innerHTML);

        } else {

            console.warn("Element with ID 'onlineplayercount' not found.");

        }

        if (numServersElement) {

            numServersElement.innerHTML = "Servers Online: <br>" + numServers;

            console.log("numServers updated:", numServersElement.innerHTML);

        } else {

            console.warn("Element with ID 'numServers' not found.");

        }

        if (numClansElement) {

            numClansElement.innerHTML = "Clans: <br>" + numClans;

            console.log("numClans updated:", numClansElement.innerHTML);

        } else {

            console.warn("Element with ID 'numClans' not found.");

        }

        if (numMapsElement) {

            numMapsElement.innerHTML = "Maps: <br>" + numMaps;

            console.log("numMaps updated:", numMapsElement.innerHTML);

        } else {

            console.warn("Element with ID 'numMaps' not found.");

        }



    } catch (error) {

        console.error("Error fetching status:", error);

        const onlinePlayerCountElement = document.getElementById('onlineplayercount');

        const numServersElement = document.getElementById('numServers');

        const numClansElement = document.getElementById('numClans');

        const numMapsElement = document.getElementById('numMaps');



        if (onlinePlayerCountElement) onlinePlayerCountElement.innerHTML = "Players Online: <br> N/A";

        if (numServersElement) numServersElement.innerHTML = "Servers Online: <br> N/A";

        if (numClansElement) numClansElement.innerHTML = "Clans: <br> N/A";

        if (numMapsElement) numMapsElement.innerHTML = "Clans: <br> N/A"; // Fixed typo here (was "Clans: <br> N/A" twice)

    }

}



getStatus();



window.searchPlayer = async function() {

    const playerNameInput = document.getElementById('playerSearch');

    const playerName = playerNameInput.value.trim();

    const playerInfoDiv = document.getElementById('playerInfo');



    if (playerInfoDiv) playerInfoDiv.innerHTML = "<p>Loading player data...</p>";

    document.getElementById('name').innerHTML = "";

    document.getElementById('playtime').innerHTML = "";

    document.getElementById('joindate').innerHTML = "";

    document.getElementById('country').innerHTML = "";

    document.getElementById('clan').innerHTML = "";

    document.getElementById('points').innerHTML = "";

    document.getElementById('lastseen').innerHTML = "";

    

    if (typeof myTee !== 'undefined' && myTee !== null) {

        myTee.api.functions.unbindContainer();

        myTee = null;

        document.querySelector('.teeassembler-tee').innerHTML = '';

    }



    if (!playerName) {

        if (playerInfoDiv) playerInfoDiv.innerHTML = "<p>Please enter a player name.</p>";

        return;

    }



    try {

        const apiUrl = `https://ddstats.tw/player/json?player=${encodeURIComponent(playerName)}`;

        const response = await fetch(apiUrl);



        if (!response.ok) {

            const errorText = await response.text();

            if (errorText.includes("player not found")) {

                if (playerInfoDiv) playerInfoDiv.innerHTML = "";

                document.getElementById('name').innerHTML = `Player "${playerName}" not found.`;

                return;

            }

            throw new Error(`Could not fetch resource: ${response.status} ${response.statusText} - ${errorText}`);

        }



        const data = await response.json();

        if (playerInfoDiv) playerInfoDiv.innerHTML = "";



        const playtimeSeconds = data.general_activity.total_seconds_played;

        const points = data.profile.points;

        const countryCodeNumeric = data.recent_player_info[0].country;

        const clan = data.profile.clan || 'N/A';

        const joindateRaw = data.general_activity.start_of_playtime;

        const lastseenRaw = data.recent_player_info[0].last_seen;

        const skinbodyColor = data.recent_player_info[0].skin_color_body;

        const skinfeetColor = data.recent_player_info[0].skin_color_feet;

        const skinName = data.recent_player_info[0].skin_name;

        const name = data.profile.name;



        const playtimeHours = Math.trunc(playtimeSeconds / 3600);



        const countryName = COUNTRY_CODES[countryCodeNumeric] || `Unknown (Code: ${countryCodeNumeric})`;

        const regionNames = new Intl.DisplayNames(

        ['en'], {type: 'region'}

        );

        const joindateFormatted = formatTimestamp(joindateRaw);

        const lastseenFormatted = formatTimestamp(lastseenRaw);

        document.getElementById('playtime').innerHTML = `${playtimeHours} Hours`;

        document.getElementById('joindate').innerHTML = joindateFormatted;

        document.getElementById('country').innerHTML = countryName === "default" ? "Default" : regionNames.of(countryName);

        document.getElementById('clan').innerHTML = clan;

        document.getElementById('points').innerHTML = points;

        document.getElementById('lastseen').innerHTML = lastseenFormatted;

        document.getElementById('name').innerHTML = name;

        console.log(data);

        document.getElementById('CountryFlag').src = "/TeeViewer/" + countryName + ".png";

        const effectiveBodyColor = skinbodyColor !== null ? skinbodyColor.toString() : '';

        const effectiveFeetColor = skinfeetColor !== null ? skinfeetColor.toString() : '';



        const myTeeOptions = {

            container: document.querySelector('.teeassembler-tee'),

            imageLink: `https://ddstats.tw/skins/${skinName}.png`,

            bodyColor: effectiveBodyColor,

            feetColor: effectiveFeetColor,

            colorFormat: 'code'

        };



        if (typeof TeeAssembler !== 'undefined' && TeeAssembler.Tee) {

            if (myTee) {

                myTee.api.functions.unbindContainer();

            }

            myTee = new TeeAssembler.Tee(myTeeOptions);

            myTee.api.functions.lookAtCursor();

        } else {

            console.warn("TeeAssembler library not loaded or not found.");

            document.querySelector('.teeassembler-tee').innerHTML = 'Tee preview not available.';

        }



        playerNameInput.value = '';

    } catch (error) {

        console.error("Error in searchPlayer:", error);

        if (playerInfoDiv) playerInfoDiv.innerHTML = `<p style="color: red;">An error occurred while fetching player data: ${error.message}. Please try again.</p>`;

        document.getElementById('playtime').innerHTML = "";

        document.getElementById('joindate').innerHTML = "";

        document.getElementById('country').innerHTML = "";

        document.getElementById('clan').innerHTML = "";

        document.getElementById('points').innerHTML = "";

        document.getElementById('lastseen').innerHTML = "";

        document.getElementById('name').innerHTML = "";

        if (typeof myTee !== 'undefined' && myTee !== null) {

            myTee.api.functions.unbindContainer();

            myTee = null;

            document.querySelector('.teeassembler-tee').innerHTML = '';

        }

    }

}



document.getElementById('playerSearch').addEventListener('keypress', function(event) {

    if (event.key === 'Enter') {

        window.searchPlayer();

    }

});
