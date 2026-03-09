/**
 * Predefined hobbies organized by category
 * Users can select from these to add to their profile
 */

export interface Hobby {
  id: string;
  name: string;
  emoji: string;
  category: HobbyCategory;
}

export type HobbyCategory =
  | 'content'
  | 'creative'
  | 'sports'
  | 'outdoors'
  | 'gaming'
  | 'music'
  | 'food'
  | 'learning'
  | 'social'
  | 'wellness'
  | 'tech'
  | 'crafts'
  | 'collecting';

export const HOBBY_CATEGORIES: { id: HobbyCategory; label: string; emoji: string }[] = [
  { id: 'content', label: 'Content', emoji: '📱' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🏕️' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'food', label: 'Food & Drink', emoji: '🍳' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'social', label: 'Social', emoji: '🎉' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'crafts', label: 'Crafts', emoji: '🧶' },
  { id: 'collecting', label: 'Collecting', emoji: '🏆' },
];

export const HOBBIES: Hobby[] = [
  // Content & Social Media
  { id: 'content-creation', name: 'Content Creation', emoji: '📱', category: 'content' },
  { id: 'tiktok', name: 'TikTok', emoji: '🎵', category: 'content' },
  { id: 'youtube', name: 'YouTube', emoji: '▶️', category: 'content' },
  { id: 'streaming', name: 'Streaming', emoji: '🎥', category: 'content' },
  { id: 'vlogging', name: 'Vlogging', emoji: '📹', category: 'content' },
  { id: 'podcasting', name: 'Podcasting', emoji: '🎙️', category: 'content' },
  { id: 'social-media', name: 'Social Media', emoji: '📲', category: 'content' },
  { id: 'influencing', name: 'Influencing', emoji: '✨', category: 'content' },
  { id: 'video-editing', name: 'Video Editing', emoji: '🎬', category: 'content' },
  { id: 'reels', name: 'Reels & Shorts', emoji: '🔄', category: 'content' },

  // Creative
  { id: 'painting', name: 'Painting', emoji: '🎨', category: 'creative' },
  { id: 'drawing', name: 'Drawing', emoji: '✏️', category: 'creative' },
  { id: 'photography', name: 'Photography', emoji: '📸', category: 'creative' },
  { id: 'writing', name: 'Writing', emoji: '✍️', category: 'creative' },
  { id: 'filmmaking', name: 'Filmmaking', emoji: '🎬', category: 'creative' },
  { id: 'graphic-design', name: 'Graphic Design', emoji: '🖼️', category: 'creative' },
  { id: 'pottery', name: 'Pottery', emoji: '🏺', category: 'creative' },
  { id: 'sculpting', name: 'Sculpting', emoji: '🗿', category: 'creative' },

  // Sports
  { id: 'basketball', name: 'Basketball', emoji: '🏀', category: 'sports' },
  { id: 'soccer', name: 'Soccer', emoji: '⚽', category: 'sports' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', category: 'sports' },
  { id: 'golf', name: 'Golf', emoji: '⛳', category: 'sports' },
  { id: 'swimming', name: 'Swimming', emoji: '🏊', category: 'sports' },
  { id: 'running', name: 'Running', emoji: '🏃', category: 'sports' },
  { id: 'cycling', name: 'Cycling', emoji: '🚴', category: 'sports' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐', category: 'sports' },
  { id: 'baseball', name: 'Baseball', emoji: '⚾', category: 'sports' },
  { id: 'football', name: 'Football', emoji: '🏈', category: 'sports' },
  { id: 'hockey', name: 'Hockey', emoji: '🏒', category: 'sports' },
  { id: 'skiing', name: 'Skiing', emoji: '⛷️', category: 'sports' },
  { id: 'snowboarding', name: 'Snowboarding', emoji: '🏂', category: 'sports' },
  { id: 'surfing', name: 'Surfing', emoji: '🏄', category: 'sports' },
  { id: 'martial-arts', name: 'Martial Arts', emoji: '🥋', category: 'sports' },
  { id: 'boxing', name: 'Boxing', emoji: '🥊', category: 'sports' },
  { id: 'rock-climbing', name: 'Rock Climbing', emoji: '🧗', category: 'sports' },

  // Outdoors
  { id: 'hiking', name: 'Hiking', emoji: '🥾', category: 'outdoors' },
  { id: 'camping', name: 'Camping', emoji: '🏕️', category: 'outdoors' },
  { id: 'fishing', name: 'Fishing', emoji: '🎣', category: 'outdoors' },
  { id: 'gardening', name: 'Gardening', emoji: '🌱', category: 'outdoors' },
  { id: 'birdwatching', name: 'Birdwatching', emoji: '🦜', category: 'outdoors' },
  { id: 'stargazing', name: 'Stargazing', emoji: '🌌', category: 'outdoors' },
  { id: 'kayaking', name: 'Kayaking', emoji: '🛶', category: 'outdoors' },
  { id: 'sailing', name: 'Sailing', emoji: '⛵', category: 'outdoors' },

  // Gaming
  { id: 'video-games', name: 'Video Games', emoji: '🎮', category: 'gaming' },
  { id: 'board-games', name: 'Board Games', emoji: '🎲', category: 'gaming' },
  { id: 'card-games', name: 'Card Games', emoji: '🃏', category: 'gaming' },
  { id: 'chess', name: 'Chess', emoji: '♟️', category: 'gaming' },
  { id: 'puzzles', name: 'Puzzles', emoji: '🧩', category: 'gaming' },
  { id: 'escape-rooms', name: 'Escape Rooms', emoji: '🔐', category: 'gaming' },
  { id: 'trivia', name: 'Trivia', emoji: '❓', category: 'gaming' },
  { id: 'esports', name: 'Esports', emoji: '🏆', category: 'gaming' },
  { id: 'anime', name: 'Anime', emoji: '🎌', category: 'gaming' },
  { id: 'manga', name: 'Manga', emoji: '📖', category: 'gaming' },
  { id: 'cosplay', name: 'Cosplay', emoji: '🎭', category: 'gaming' },

  // Music
  { id: 'guitar', name: 'Guitar', emoji: '🎸', category: 'music' },
  { id: 'piano', name: 'Piano', emoji: '🎹', category: 'music' },
  { id: 'drums', name: 'Drums', emoji: '🥁', category: 'music' },
  { id: 'singing', name: 'Singing', emoji: '🎤', category: 'music' },
  { id: 'dj', name: 'DJing', emoji: '🎧', category: 'music' },
  { id: 'music-production', name: 'Music Production', emoji: '🎛️', category: 'music' },
  { id: 'violin', name: 'Violin', emoji: '🎻', category: 'music' },
  { id: 'kpop', name: 'K-Pop', emoji: '🇰🇷', category: 'music' },
  { id: 'rap', name: 'Rap & Hip-Hop', emoji: '🎤', category: 'music' },
  { id: 'edm', name: 'EDM', emoji: '🎧', category: 'music' },
  { id: 'indie', name: 'Indie Music', emoji: '🎸', category: 'music' },
  { id: 'playlists', name: 'Curating Playlists', emoji: '📋', category: 'music' },

  // Food & Drink
  { id: 'cooking', name: 'Cooking', emoji: '👨‍🍳', category: 'food' },
  { id: 'baking', name: 'Baking', emoji: '🍰', category: 'food' },
  { id: 'wine-tasting', name: 'Wine Tasting', emoji: '🍷', category: 'food' },
  { id: 'coffee', name: 'Coffee', emoji: '☕', category: 'food' },
  { id: 'craft-beer', name: 'Craft Beer', emoji: '🍺', category: 'food' },
  { id: 'food-exploring', name: 'Food Exploring', emoji: '🍜', category: 'food' },
  { id: 'grilling', name: 'Grilling', emoji: '🍖', category: 'food' },
  { id: 'mixology', name: 'Mixology', emoji: '🍸', category: 'food' },

  // Learning
  { id: 'reading', name: 'Reading', emoji: '📚', category: 'learning' },
  { id: 'languages', name: 'Languages', emoji: '🗣️', category: 'learning' },
  { id: 'history', name: 'History', emoji: '🏛️', category: 'learning' },
  { id: 'science', name: 'Science', emoji: '🔬', category: 'learning' },
  { id: 'philosophy', name: 'Philosophy', emoji: '🤔', category: 'learning' },
  { id: 'podcasts', name: 'Podcasts', emoji: '🎙️', category: 'learning' },
  { id: 'documentaries', name: 'Documentaries', emoji: '🎞️', category: 'learning' },
  { id: 'online-courses', name: 'Online Courses', emoji: '💡', category: 'learning' },
  { id: 'true-crime', name: 'True Crime', emoji: '🔍', category: 'learning' },
  { id: 'finance', name: 'Personal Finance', emoji: '💰', category: 'learning' },
  { id: 'investing', name: 'Investing', emoji: '📈', category: 'learning' },
  { id: 'side-hustles', name: 'Side Hustles', emoji: '💼', category: 'learning' },

  // Social
  { id: 'traveling', name: 'Traveling', emoji: '✈️', category: 'social' },
  { id: 'volunteering', name: 'Volunteering', emoji: '🤝', category: 'social' },
  { id: 'dancing', name: 'Dancing', emoji: '💃', category: 'social' },
  { id: 'karaoke', name: 'Karaoke', emoji: '🎤', category: 'social' },
  { id: 'networking', name: 'Networking', emoji: '🤝', category: 'social' },
  { id: 'parties', name: 'Parties', emoji: '🎉', category: 'social' },
  { id: 'comedy', name: 'Comedy Shows', emoji: '😂', category: 'social' },
  { id: 'theater', name: 'Theater', emoji: '🎭', category: 'social' },
  { id: 'thrifting', name: 'Thrifting', emoji: '🛍️', category: 'social' },
  { id: 'brunch', name: 'Brunch', emoji: '🥂', category: 'social' },
  { id: 'concerts', name: 'Concerts', emoji: '🎶', category: 'social' },
  { id: 'festivals', name: 'Festivals', emoji: '🎪', category: 'social' },
  { id: 'road-trips', name: 'Road Trips', emoji: '🚗', category: 'social' },

  // Wellness
  { id: 'yoga', name: 'Yoga', emoji: '🧘', category: 'wellness' },
  { id: 'meditation', name: 'Meditation', emoji: '🧘‍♂️', category: 'wellness' },
  { id: 'fitness', name: 'Fitness', emoji: '💪', category: 'wellness' },
  { id: 'weightlifting', name: 'Weightlifting', emoji: '🏋️', category: 'wellness' },
  { id: 'pilates', name: 'Pilates', emoji: '🤸', category: 'wellness' },
  { id: 'spa', name: 'Spa & Self-care', emoji: '💆', category: 'wellness' },
  { id: 'journaling', name: 'Journaling', emoji: '📝', category: 'wellness' },
  { id: 'nutrition', name: 'Nutrition', emoji: '🥗', category: 'wellness' },
  { id: 'skincare', name: 'Skincare', emoji: '✨', category: 'wellness' },
  { id: 'astrology', name: 'Astrology', emoji: '♈', category: 'wellness' },
  { id: 'manifesting', name: 'Manifesting', emoji: '🌟', category: 'wellness' },
  { id: 'crystals', name: 'Crystals', emoji: '💎', category: 'wellness' },
  { id: 'mental-health', name: 'Mental Health', emoji: '🧠', category: 'wellness' },
  { id: 'hot-girl-walks', name: 'Hot Girl Walks', emoji: '🚶‍♀️', category: 'wellness' },

  // Tech
  { id: 'programming', name: 'Programming', emoji: '💻', category: 'tech' },
  { id: 'robotics', name: 'Robotics', emoji: '🤖', category: 'tech' },
  { id: '3d-printing', name: '3D Printing', emoji: '🖨️', category: 'tech' },
  { id: 'electronics', name: 'Electronics', emoji: '🔌', category: 'tech' },
  { id: 'ai-ml', name: 'AI & Machine Learning', emoji: '🧠', category: 'tech' },
  { id: 'crypto', name: 'Cryptocurrency', emoji: '🪙', category: 'tech' },
  { id: 'vr-ar', name: 'VR/AR', emoji: '🥽', category: 'tech' },
  { id: 'home-automation', name: 'Home Automation', emoji: '🏠', category: 'tech' },

  // Crafts
  { id: 'knitting', name: 'Knitting', emoji: '🧶', category: 'crafts' },
  { id: 'sewing', name: 'Sewing', emoji: '🧵', category: 'crafts' },
  { id: 'woodworking', name: 'Woodworking', emoji: '🪵', category: 'crafts' },
  { id: 'jewelry-making', name: 'Jewelry Making', emoji: '💎', category: 'crafts' },
  { id: 'leatherworking', name: 'Leatherworking', emoji: '👜', category: 'crafts' },
  { id: 'candle-making', name: 'Candle Making', emoji: '🕯️', category: 'crafts' },
  { id: 'origami', name: 'Origami', emoji: '📄', category: 'crafts' },
  { id: 'scrapbooking', name: 'Scrapbooking', emoji: '📒', category: 'crafts' },

  // Collecting
  { id: 'vinyl-records', name: 'Vinyl Records', emoji: '📀', category: 'collecting' },
  { id: 'stamps', name: 'Stamps', emoji: '📮', category: 'collecting' },
  { id: 'coins', name: 'Coins', emoji: '🪙', category: 'collecting' },
  { id: 'art', name: 'Art', emoji: '🖼️', category: 'collecting' },
  { id: 'sneakers', name: 'Sneakers', emoji: '👟', category: 'collecting' },
  { id: 'watches', name: 'Watches', emoji: '⌚', category: 'collecting' },
  { id: 'books', name: 'Books', emoji: '📚', category: 'collecting' },
  { id: 'antiques', name: 'Antiques', emoji: '🏺', category: 'collecting' },
];

export function getHobbyById(id: string): Hobby | undefined {
  return HOBBIES.find(h => h.id === id);
}

export function getHobbiesByCategory(category: HobbyCategory): Hobby[] {
  return HOBBIES.filter(h => h.category === category);
}

export function getCategoryLabel(category: HobbyCategory): string {
  return HOBBY_CATEGORIES.find(c => c.id === category)?.label || category;
}
