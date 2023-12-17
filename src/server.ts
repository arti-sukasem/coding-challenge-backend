import express from "express"
import {getDBConnection} from "./database";
import {retrieveWeather} from "./external_api";
import {getDaysDifference} from "./utils";


interface Weather {
    temperatureInDegreesCelcius: number;
    chanceOfRain: number;
  }
  
interface Event {
    id: number;
    name: string;
    date: string;
    isOutside: number;
    attendees: Array<number>;
    organizer: {
        id?: number;
        name?: string;
    };
    weather?: Weather | null;
}

// initialise parameters
const port = 4040
const app = express()
const db = getDBConnection()

// GET a main page
app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Function to generate the common part of the SQL query
function getBaseQuery() {
    return `
        SELECT
            events.id AS event_id,
            events.name AS event_name,
            events.date AS event_date,
            events.location AS event_location,
            events.isOutside AS is_outside,
            organizers.id AS organizer_id,
            organizers.name AS organizer_name,
            JSON_GROUP_ARRAY(events_attendees_attendees.attendeesId) AS attendees
        FROM
            events
        JOIN
            organizers ON events.organizer_id = organizers.id
        LEFT JOIN
            events_attendees_attendees ON events.id = events_attendees_attendees.eventsId
    `;
}

// GET /events
app.get('/events', (req, res) => {
    const { from, until } = req.query;

    let query = getBaseQuery();

    if (from && until == null) {
        query += ' WHERE events.date >= ?';
    }

    if (from && until) {
        query += ' WHERE events.date BETWEEN ? AND ?';
    }

    query += ' GROUP BY events.id, organizers.id';

    db.all(query, [from, until], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const results: Event[] = rows.map((row) => ({
            id: row.event_id,
            name: row.event_name,
            date: row.event_date,
            isOutside: row.is_outside,
            attendees: row.attendees ? JSON.parse(row.attendees) : [],
            organizer: {
                id: row.organizer_id,
                name: row.organizer_name,
            },
        }));

        res.json({ results });
    });
});

// GET /events/:eventId
app.get('/events/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    const query = getBaseQuery() + ' WHERE events.id = ? GROUP BY events.id, organizers.id';

    db.get(query, [eventId], async (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        
        // Calculating the daydifference between the current date and the upcoming date
        const currentDate = new Date();
        const eventDate = new Date(row.event_date);
        const daysDifference = getDaysDifference(currentDate, eventDate);

        let weatherData = null;
        if (daysDifference <= 7 && row.is_outside == 1) {
            weatherData = await retrieveWeather(row.event_location, daysDifference);
        };

        const result: Event = {
            id: row.event_id,
            name: row.event_name,
            date: row.event_date,
            isOutside: row.is_outside,
            attendees: row.attendees ? JSON.parse(row.attendees) : [],
            organizer: {
                id: row.organizer_id,
                name: row.organizer_name,
            },
            // if an event is outside and occuring withing 7 days, call any weather api to get the following details
            // if an event is not outside, or not occuring within 7 days this should be null
            weather: weatherData?.forecast?.forecastday?.[0] ? {
                temperatureInDegreesCelcius: weatherData.forecast.forecastday[0].day.avgtemp_c,
                chanceOfRain: weatherData.forecast.forecastday[0].day.daily_chance_of_rain,
            } : null
        };

        res.json(result);
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
        // resolve(server)
    });
}


export default app;
