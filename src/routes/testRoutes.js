const express = require('express');
const router = express.Router();

router.get('/user', (req, res) => {
    let player = {
        puuid: '1234567890abcdef',
        name: 'Aidanator',
        tag: 'JAX',
        region: 'na',
        rank: 'Gold',
        tier: 'IV',
        lp: 100,
        winrate: 55.5,
        games_played: 200,
        last_match_date: '2023-10-01',
        card: '/images/small_player.jpg',
        rankIcon: '/images/ranks/gold_1.png',
        rankText: 'Gold 1',
        peakRankIcon: '/images/ranks/diamond_3.png',
        peakRankText: 'Diamond 3',
        stats: {
            overall: {
                kd: "1.21",
                kda: "1.87",
                hs: "23.4",
                win: "52",
                timePlayed: "36h",
                topAgent: "Jett"
            },
            season: {
                kd: "1.09",
                kda: "1.62",
                hs: "21.1",
                win: "49",
                timePlayed: "14h",
                topAgent: "Raze"
            },
            recent: {
                kd: "1.32",
                kda: "2.00",
                hs: "25.6",
                win: "60",
                timePlayed: "3h",
                topAgent: "Killjoy"
            }
        }
    };
    let matches = [
        {
            date: '2025-03-25 17:43',
            dateOnly: '2025-03-25',
            timeOnly: '17:43',
            map: 'Ascent',
            mapImage: '/images/maps/Ascent.jpg',
            agentIcon: '/images/agents/jett.png',
            win: true,
            teamScore: '13',
            enemyScore: '9',
            acs: 233,
            kd: '1.2',
            kda: '1.7',
            hs: '28'
        },
        {
            date: '2025-03-24 15:30',
            dateOnly: '2025-03-24',
            timeOnly: '15:30',
            map: 'Haven',
            mapImage: '/images/maps/Haven.jpg',
            agentIcon: '/images/agents/sova.png',
            win: false,
            score: '10 - 13',
            teamScore: '10',
            enemyScore: '13',
            acs: 198,
            kd: '0.9',
            kda: '1.2',
            hs: '22'
        },
        {
            date: '2025-03-23 14:15',
            dateOnly: '2025-03-23',
            timeOnly: '14:15',
            map: 'Split',
            mapImage: '/images/maps/Split.jpg',
            agentIcon: '/images/agents/raze.png',
            win: true,
            score: '13 - 11',
            teamScore: '13',
            enemyScore: '11',
            acs: 245,
            kd: '1.4',
            kda: '2.0',
            hs: '30'
        }
    ];
    res.render('pages/user.ejs', {
        title: 'User Test Page',
        pageStyles: '/styles/user.css',
        player,
        matches,
    });
});

// You can add more test endpoints here

module.exports = router;
