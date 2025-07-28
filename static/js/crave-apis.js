// Generic function to fetch with retry
function fetchWithRetry(url, options = {}, retries = 2) {
    return fetch(url, options)
        .then(res => {
            if (res.ok) return res.json();
            if (retries > 0) return fetchWithRetry(url, options, retries - 1);
            throw new Error('API failed after retries');
        })
        .catch(error => {
            if (retries > 0) return fetchWithRetry(url, options, retries - 1);
            throw error;
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Set badge color based on craving type
    const badge = document.querySelector('.craving-type-badge');
    if (badge) {
        const type = badge.textContent.toLowerCase();
        if (type === 'physical') {
            badge.style.background = 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)';
        } else if (type === 'psychological') {
            badge.style.background = 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)';
        } else {
            badge.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)';
        }
    }

    // Fetch all APIs
    fetchZenQuote();
    fetchAdvice();
    fetchCatFact();
    fetchYesNo();
    fetchKanyeQuote();
    fetchUselessFact();
    fetchStoicQuote();
    fetchActivity();
    fetchRandomRecipe();
    
    // Add event listener for recipe buttons
    document.querySelectorAll('.view-recipe-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mealName = this.getAttribute('data-meal');
            fetchMealDetails(mealName);
        });
    });
});

// Fetch mindfulness quote
function fetchZenQuote() {
    const container = document.getElementById('zen-quote');
    
    // Primary API
    fetchWithRetry('https://zenquotes.io/api/random')
        .then(data => {
            if (data[0] && data[0].q) {
                const quote = data[0].q;
                const author = data[0].a;
                container.innerHTML = `
                    <div class="api-icon">🧘</div>
                    <h3>Mindfulness Quote</h3>
                    <div class="api-content">
                        <p>"${quote}"</p>
                        <p class="author">— ${author}</p>
                    </div>
                `;
            } else {
                // Fallback to another API
                throw new Error('Primary quote API failed');
            }
        })
        .catch(() => {
            // Fallback API
            fetchWithRetry('https://api.quotable.io/random')
                .then(data => {
                    container.innerHTML = `
                        <div class="api-icon">🧘</div>
                        <h3>Mindfulness Quote</h3>
                        <div class="api-content">
                            <p>"${data.content}"</p>
                            <p class="author">— ${data.author}</p>
                        </div>
                    `;
                })
                .catch(() => {
                    container.innerHTML = `
                        <div class="api-icon">🧘</div>
                        <h3>Mindfulness Quote</h3>
                        <div class="api-content">
                            <p class="error">Quotes unavailable. Find peace within.</p>
                        </div>
                    `;
                });
        });
}

// Fetch life advice
function fetchAdvice() {
    const container = document.getElementById('advice-slip');
    fetchWithRetry('https://api.adviceslip.com/advice')
        .then(data => {
            container.innerHTML = `
                <div class="api-icon">💡</div>
                <h3>Wise Advice</h3>
                <div class="api-content">
                    <p>${data.slip.advice}</p>
                </div>
            `;
        })
        .catch(() => {
            container.innerHTML = `
                <div class="api-icon">💡</div>
                <h3>Wise Advice</h3>
                <div class="api-content">
                    <p class="error">Advice not available. Trust yourself.</p>
                </div>
            `;
        });
}

// Fetch cat fact
function fetchCatFact() {
    const container = document.getElementById('cat-fact');
    fetchWithRetry('https://catfact.ninja/fact')
        .then(data => {
            container.innerHTML = `
                <div class="api-icon">🐱</div>
                <h3>Purrfect Distraction</h3>
                <div class="api-content">
                    <p>${data.fact}</p>
                </div>
            `;
        })
        .catch(() => {
            container.innerHTML = `
                <div class="api-icon">🐱</div>
                <h3>Purrfect Distraction</h3>
                <div class="api-content">
                    <p class="error">Cat facts unavailable. Pet a cat instead.</p>
                </div>
            `;
        });
}

// Fetch yes/no answer with GIF
function fetchYesNo() {
    const container = document.getElementById('yes-no');
    fetchWithRetry('https://yesno.wtf/api')
        .then(data => {
            container.innerHTML = `
                <div class="api-icon">✅</div>
                <h3>Should You Act On It?</h3>
                <div class="api-content">
                    <p>Answer: <strong>${data.answer.toUpperCase()}</strong></p>
                    <img src="${data.image}" alt="${data.answer} GIF" class="yesno-gif">
                </div>
            `;
        })
        .catch(() => {
            container.innerHTML = `
                <div class="api-icon">✅</div>
                <h3>Should You Act On It?</h3>
                <div class="api-content">
                    <p class="error">Decision unclear. Listen to your intuition.</p>
                </div>
            `;
        });
}

// Fetch Kanye quote
function fetchKanyeQuote() {
    const container = document.getElementById('kanye-quote');
    fetchWithRetry('https://api.kanye.rest')
        .then(data => {
            container.innerHTML = `
                <div class="api-icon">🎤</div>
                <h3>Creative Interruption</h3>
                <div class="api-content">
                    <p>"${data.quote}"</p>
                    <p class="author">— Kanye West</p>
                </div>
            `;
        })
        .catch(() => {
            container.innerHTML = `
                <div class="api-icon">🎤</div>
                <h3>Creative Interruption</h3>
                <div class="api-content">
                    <p class="error">Kanye is thinking. Try again later.</p>
                </div>
            `;
        });
}

// Fetch useless fact
function fetchUselessFact() {
    const container = document.getElementById('useless-fact');
    fetchWithRetry('https://uselessfacts.jsph.pl/random.json?language=en')
        .then(data => {
            container.innerHTML = `
                <div class="api-icon">🤯</div>
                <h3>Useless Knowledge</h3>
                <div class="api-content">
                    <p>${data.text}</p>
                </div>
            `;
        })
        .catch(() => {
            container.innerHTML = `
                <div class="api-icon">🤯</div>
                <h3>Useless Knowledge</h3>
                <div class="api-content">
                    <p class="error">No facts available. Enjoy the silence.</p>
                </div>
            `;
        });
}

// Fetch stoic quote
function fetchStoicQuote() {
    const container = document.getElementById('stoic-quote');
    fetchWithRetry('https://stoic-quotes.com/api/quote')
        .then(data => {
            container.innerHTML = `
                <div class="api-icon">🏛️</div>
                <h3>Stoic Wisdom</h3>
                <div class="api-content">
                    <p>"${data.text}"</p>
                    <p class="author">— ${data.author}</p>
                </div>
            `;
        })
        .catch(() => {
            container.innerHTML = `
                <div class="api-icon">🏛️</div>
                <h3>Stoic Wisdom</h3>
                <div class="api-content">
                    <p class="error">Ancient wisdom unavailable. Practice virtue.</p>
                </div>
            `;
        });
}

// Fetch activity suggestion
function fetchActivity() {
    const container = document.getElementById('bored-api');
    const fallbackActivities = [
        "Go for a 10-minute walk",
        "Write down three things you're grateful for",
        "Do 5 minutes of stretching",
        "Call a friend or family member",
        "Listen to your favorite song",
        "Read a book for 10 minutes",
        "Try a 5-minute meditation"
    ];
    
    // Primary API
    fetchWithRetry('https://www.boredapi.com/api/activity/')
        .then(data => {
            if (data.activity) {
                container.innerHTML = `
                    <div class="api-icon">🎯</div>
                    <h3>Crave Breaker Activity</h3>
                    <div class="api-content">
                        <p>${data.activity}</p>
                        <p class="details">Type: ${data.type} | Participants: ${data.participants}</p>
                    </div>
                `;
            } else {
                throw new Error('Activity API failed');
            }
        })
        .catch(() => {
            // Fallback activities
            const randomActivity = fallbackActivities[Math.floor(Math.random() * fallbackActivities.length)];
            container.innerHTML = `
                <div class="api-icon">🎯</div>
                <h3>Crave Breaker Activity</h3>
                <div class="api-content">
                    <p>${randomActivity}</p>
                </div>
            `;
        });
}

// Fetch random recipe
function fetchRandomRecipe() {
    const container = document.getElementById('random-recipe');
    fetchWithRetry('https://www.themealdb.com/api/json/v1/1/random.php')
        .then(data => {
            const meal = data.meals[0];
            container.innerHTML = `
                <div class="api-icon">🍳</div>
                <h3>Random Recipe</h3>
                <div class="api-content">
                    <h4>${meal.strMeal}</h4>
                    <p>${meal.strCategory} • ${meal.strArea}</p>
                    <button class="view-recipe-btn" data-meal="${meal.strMeal}">View Recipe</button>
                </div>
            `;
            
            // Add event listener to the new button
            container.querySelector('.view-recipe-btn').addEventListener('click', function() {
                fetchMealDetails(meal.strMeal);
            });
        })
        .catch(() => {
            container.innerHTML = `
                <div class="api-icon">🍳</div>
                <h3>Random Recipe</h3>
                <div class="api-content">
                    <p class="error">Recipe unavailable. Get creative!</p>
                </div>
            `;
        });
}

// Fetch meal details
function fetchMealDetails(mealName) {
    fetchWithRetry(`/get_meal_details?meal=${encodeURIComponent(mealName)}`)
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            // Create modal content
            const modalContent = `
                <div class="modal">
                    <div class="modal-content">
                        <span class="close-btn">&times;</span>
                        <h2>${data.name}</h2>
                        <div class="recipe-header">
                            <img src="${data.image}" alt="${data.name}">
                            <div class="recipe-meta">
                                <p><strong>Category:</strong> ${data.category}</p>
                                <p><strong>Cuisine:</strong> ${data.area}</p>
                                ${data.youtube ? `<p><a href="${data.youtube}" target="_blank">Watch Video Tutorial</a></p>` : ''}
                            </div>
                        </div>
                        
                        <div class="recipe-section">
                            <h3>Ingredients</h3>
                            <ul>
                                ${data.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="recipe-section">
                            <h3>Instructions</h3>
                            <div class="instructions">${data.instructions.split('\n').map(p => `<p>${p}</p>`).join('')}</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to body
            const modal = document.createElement('div');
            modal.innerHTML = modalContent;
            document.body.appendChild(modal);
            
            // Add close functionality
            modal.querySelector('.close-btn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        })
        .catch(error => {
            alert('Failed to load recipe details');
            console.error(error);
        });
}