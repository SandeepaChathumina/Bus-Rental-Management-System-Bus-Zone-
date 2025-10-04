// Simple Places Controller - Basic travel suggestions
export const getTravelSuggestions = async (req, res) => {
  try {
    const { destination } = req.query;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required'
      });
    }

    // Simple hardcoded data for now
    const suggestions = {
      'Colombo': {
        attractions: [
          { name: 'Gangaramaya Temple', rating: 4.5, address: 'Beira Lake, Colombo 02' },
          { name: 'Independence Memorial Hall', rating: 4.2, address: 'Independence Square, Colombo 07' },
          { name: 'National Museum', rating: 4.0, address: 'Sir Marcus Fernando Mawatha, Colombo 07' }
        ],
        restaurants: [
          { name: 'Ministry of Crab', rating: 4.6, address: 'Old Dutch Hospital, Fort' },
          { name: 'Paradise Road Galleries', rating: 4.3, address: 'Alfred House Road, Colombo 03' }
        ]
      },
      'Kandy': {
        attractions: [
          { name: 'Temple of the Sacred Tooth Relic', rating: 4.7, address: 'Temple Square, Kandy' },
          { name: 'Royal Botanical Gardens', rating: 4.5, address: 'Peradeniya, Kandy' }
        ],
        restaurants: [
          { name: 'Empire Cafe', rating: 4.3, address: 'Dalada Veediya, Kandy' }
        ]
      }
    };

    const data = suggestions[destination] || { attractions: [], restaurants: [] };

    res.json({
      success: true,
      destination,
      data
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
