import supertest from 'supertest';
import app from './server';

const request = supertest(app);

describe('Testing APIs', () => {

  it('should return a hello message in the root directory /', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  it('should return a hello message in the root directory /events', async () => {
    const response = await request.get('/events');

    expect(response.status).toBe(200);
    expect(response.body.results.length).toBe(7);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.results[0].id).toBe(1);
    expect(response.body.results[0].name).toBe('Sherpa event: bowling');
    expect(response.body.results[0].date).toBe('2022-06-22');
    expect(response.body.results[0].isOutside).toBe(0);
    expect(response.body.results[0].organizer.name).toBe('Harriet Smith');

  });

  it('should return a hello message in the root directory /events/1', async () => {
    const response = await request.get('/events/1');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.id).toBe(1);
    expect(response.body.name).toBe('Sherpa event: bowling');
    expect(response.body.date).toBe('2022-06-22');
    expect(response.body.isOutside).toBe(0);
    expect(response.body.organizer.name).toBe('Harriet Smith');
    expect(response.body.weather).toBe(null);
  });

  it('should return a hello message in the root directory /events/2', async () => {
    const response = await request.get('/events/2');
    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.id).toBe(2);
    expect(response.body.name).toBe('Sherpa event: day at the beach');
    expect(response.body.date).toBe('2022-06-22');
    expect(response.body.isOutside).toBe(1);
    expect(response.body.organizer.name).toBe('Azhar Khan');
    expect(response.body.weather).toBe(null);
  });


});
