// Formality Analyzer JavaScript
class FormalityAnalyzer {
  constructor() {
    this.informalWords = [
      'gonna',
      'wanna',
      'gotta',
      'kinda',
      'sorta',
      'yeah',
      'ok',
      'okay',
      'cool',
      'awesome',
      'super',
      'really',
      'pretty',
      'quite',
      'totally',
      'definitely',
      'basically',
      'literally',
      'obviously',
      'seriously',
      'actually',
      'honestly',
      'frankly',
      'personally',
      'anyway',
      'whatever',
      'stuff',
      'things',
      'guys',
      'folks',
      "y'all",
      "you'll",
      "we'll",
      "they'll",
      "can't",
      "won't",
      "don't",
      "isn't",
      "aren't",
      "wasn't",
      "weren't",
      "haven't",
      "hasn't",
      "hadn't",
      "wouldn't",
      "couldn't",
      "shouldn't",
    ];

    this.informalPhrases = [
      'a bunch of',
      'a lot of',
      'tons of',
      'loads of',
      'heaps of',
      'no big deal',
      'piece of cake',
      'walk in the park',
      'right off the bat',
      'get the ball rolling',
      'hit the ground running',
      'think outside the box',
      'low-hanging fruit',
    ];

    this.formalReplacements = {
      gonna: 'going to',
      wanna: 'want to',
      gotta: 'must',
      kinda: 'somewhat',
      sorta: 'somewhat',
      yeah: 'yes',
      ok: 'acceptable',
      okay: 'acceptable',
      cool: 'excellent',
      awesome: 'excellent',
      super: 'very',
      really: 'very',
      pretty: 'quite',
      totally: 'completely',
      definitely: 'certainly',
      basically: 'essentially',
      literally: 'actually',
      obviously: 'clearly',
      seriously: 'indeed',
      actually: 'in fact',
      honestly: 'truthfully',
      frankly: 'candidly',
      personally: 'in my opinion',
      anyway: 'nevertheless',
      whatever: 'regardless',
      stuff: 'items',
      things: 'items',
      guys: 'team members',
      folks: 'individuals',
      'a bunch of': 'numerous',
      'a lot of': 'many',
      'tons of': 'numerous',
      'loads of': 'many',
      'heaps of': 'numerous',
    };

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const slider = document.getElementById('formalitySlider');
    const valueDisplay = document.getElementById('formalityValue');
    const analyzeButton = document.getElementById('analyzeButton');

    // Update slider value display
    slider.addEventListener('input', (e) => {
      valueDisplay.textContent = e.target.value;
    });

    // Analyze button click
    analyzeButton.addEventListener('click', () => {
      this.analyzeText();
    });
  }

  analyzeText() {
    const jobDescriptionInput = document.getElementById('jobDescriptionInput');
    const text = jobDescriptionInput.value.trim();

    if (!text) {
      alert('Please enter a job description to analyze.');
      return;
    }

    const desiredFormality = parseInt(document.getElementById('formalitySlider').value, 10);

    // Show results section
    document.getElementById('analysisResults').classList.remove('hidden');

    // Perform analysis
    const analysis = this.performAnalysis(text);

    // Display results
    this.displayResults(analysis, desiredFormality);
  }

  performAnalysis(text) {
    const words = text.toLowerCase().split(/\s+/);
    const _sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    const informalWordsFound = [];
    const informalPhrasesFound = [];
    const suggestions = [];

    // Check for informal words
    this.informalWords.forEach((word) => {
      if (text.toLowerCase().includes(word)) {
        informalWordsFound.push(word);
        if (this.formalReplacements[word]) {
          suggestions.push(`Replace "${word}" with "${this.formalReplacements[word]}"`);
        }
      }
    });

    // Check for informal phrases
    this.informalPhrases.forEach((phrase) => {
      if (text.toLowerCase().includes(phrase)) {
        informalPhrasesFound.push(phrase);
        if (this.formalReplacements[phrase]) {
          suggestions.push(`Replace "${phrase}" with "${this.formalReplacements[phrase]}"`);
        }
      }
    });

    // Calculate formality score (1-10 scale)
    const totalIssues = informalWordsFound.length + informalPhrasesFound.length;
    const wordCount = words.length;
    const informalityRatio = totalIssues / Math.max(wordCount, 1);

    // Convert to 1-10 scale (higher = more formal)
    const formalityScore = Math.max(1, Math.min(10, Math.round(10 - informalityRatio * 50)));

    // Generate improved text
    let improvedText = text;
    Object.entries(this.formalReplacements).forEach(([informal, formal]) => {
      const regex = new RegExp(`\\b${informal}\\b`, 'gi');
      improvedText = improvedText.replace(regex, formal);
    });

    // Add general suggestions
    if (totalIssues === 0) {
      suggestions.push('Your job description appears to have appropriate formality level.');
    } else {
      suggestions.push('Consider using more professional terminology');
      suggestions.push('Avoid contractions and colloquial expressions');
      suggestions.push('Use complete sentences with proper grammar');
    }

    return {
      currentScore: formalityScore,
      informalElements: [...informalWordsFound, ...informalPhrasesFound],
      suggestions: suggestions,
      improvedText: improvedText,
    };
  }

  displayResults(analysis, desiredFormality) {
    // Display current score
    const currentScoreElement = document.getElementById('currentScore');
    const scoreText = `${analysis.currentScore}/10`;
    const comparison =
      analysis.currentScore >= desiredFormality
        ? ' (Meets desired level)'
        : ` (Below desired level of ${desiredFormality})`;
    currentScoreElement.textContent = scoreText + comparison;

    // Display informal elements
    const informalElementsList = document.getElementById('informalElements');
    informalElementsList.innerHTML = '';

    if (analysis.informalElements.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No informal elements detected';
      li.className = 'text-success';
      informalElementsList.appendChild(li);
    } else {
      analysis.informalElements.forEach((element) => {
        const li = document.createElement('li');
        li.textContent = `"${element}"`;
        li.className = 'text-warning';
        informalElementsList.appendChild(li);
      });
    }

    // Display suggestions
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';

    analysis.suggestions.forEach((suggestion) => {
      const li = document.createElement('li');
      li.textContent = suggestion;
      suggestionsList.appendChild(li);
    });

    // Display improved text
    const improvedTextArea = document.getElementById('improvedText');
    improvedTextArea.value = analysis.improvedText;
  }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new FormalityAnalyzer();
});
