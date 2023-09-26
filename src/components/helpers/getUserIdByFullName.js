export async function getUserNames() {
    const url = 'https://parseapi.back4app.com/classes/_User';
  
    const response = await fetch(url, {
      headers: {
        'X-Parse-Application-Id':
        process.env.REACT_APP_PARSE_APPLICATION_ID,
      'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
      },
    });
  
    if (response.ok) {
      const data = await response.json();
      return data.results.map(user => `${user.name} ${user.surname}`);
    } else {
      throw new Error('Error fetching user names');
    }
  }
  