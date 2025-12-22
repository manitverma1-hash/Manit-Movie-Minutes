
import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import Button from './shared/Button';
import Input from './shared/Input';

// --- Data Constants ---

const STAR_MAP_DATA: Record<string, string[]> = {
  "Himachal Pradesh": ["Preity Zinta", "Kangana Ranaut", "Yami Gautam", "Anupam Kher", "Mohit Raina", "Rubina Dilaik"],
  "Punjab": ["Dharmendra", "Akshay Kumar", "Sunny Deol", "Ayushmann Khurrana", "Vicky Kaushal", "Diljit Dosanjh", "Kapil Sharma", "Sonu Sood", "Juhi Chawla", "Neha Dhupia", "Jimmy Sheirgill"],
  "Haryana": ["Rajkummar Rao", "Parineeti Chopra", "Randeep Hooda", "Sonu Nigam", "Jaideep Ahlawat", "Mallika Sherawat", "Satish Kaushik"],
  "Delhi": ["Shah Rukh Khan", "Sidharth Malhotra", "Kriti Sanon", "Shahid Kapoor", "Ajay Devgn", "Saif Ali Khan", "Huma Qureshi", "Rakul Preet Singh", "Neena Gupta", "Gajraj Rao"],
  "Rajasthan": ["Irrfan Khan", "Mika Singh", "Nimrat Kaur", "Sharat Saxena"],
  "Uttar Pradesh": ["Amitabh Bachchan", "Nawazuddin Siddiqui", "Rajpal Yadav", "Naseeruddin Shah", "Disha Patani", "Ali Fazal", "Anurag Kashyap", "Javed Akhtar", "Lara Dutta"],
  "Jharkhand/Bihar": ["Priyanka Chopra", "Manoj Bajpayee", "Pankaj Tripathi", "Sushant Singh Rajput", "Imtiaz Ali", "Neeraj Kabi", "Prakash Jha", "Sanjay Mishra"],
  "West Bengal": ["Rani Mukerji", "Sharmila Tagore", "Mithun Chakraborty", "Konkona Sen Sharma", "Bipasha Basu", "Kajol", "Sushmita Sen", "Mouni Roy", "Victor Banerjee", "Moushumi Chatterjee"],
  "Madhya Pradesh": ["Salman Khan", "Lata Mangeshkar", "Arjun Rampal", "Johnny Lever", "Annu Kapoor", "Swanand Kirkire"],
  "Maharashtra": ["Aamir Khan", "Ranbir Kapoor", "Alia Bhatt", "Madhuri Dixit", "Shraddha Kapoor", "Riteish Deshmukh", "Sonali Bendre", "Urmila Matondkar", "Jackie Shroff", "Kareena Kapoor", "Karishma Kapoor"],
  "Jammu & Kashmir": ["Vidyut Jammwal", "Kunal Khemu", "Zaira Wasim", "Jeevan"],
  "Uttarakhand": ["Nawazuddin Siddiqui", "Jubin Nautiyal", "Urvashi Rautela", "Deepak Dobriyal", "Himani Shivpuri"],
  "Telangana": ["Tabu", "Dia Mirza", "Rana Daggubati", "Jaya Prada", "Aditi Rao Hydari"],
  "Karnataka": ["Deepika Padukone", "Aishwarya Rai", "Shilpa Shetty", "Suniel Shetty", "Prakash Raj", "Prabhu Deva"],
  "Tamil Nadu": ["Rekha", "Hema Malini", "Sridevi", "Kamal Haasan", "Vidya Balan", "A.R. Rahman", "Vyjayanthimala", "Shruti Haasan", "Mani Ratnam"],
  "Kerala": ["John Abraham", "Asin", "Kay Kay Menon", "Prithviraj Sukumaran"],
};

interface StarEvent {
  day: number;
  month: string;
  name: string;
  type: 'Birthday' | 'Death' | 'Marriage';
  year: string;
  description?: string;
}

const STAR_EVENTS: StarEvent[] = [
  // January
  { day: 1, month: "Jan", name: "Vidya Balan", type: "Birthday", year: "1979" },
  { day: 5, month: "Jan", name: "Deepika Padukone", type: "Birthday", year: "1986" },
  { day: 6, month: "Jan", name: "A.R. Rahman", type: "Birthday", year: "1967" },
  { day: 7, month: "Jan", name: "Irrfan Khan", type: "Birthday", year: "1967" },
  { day: 9, month: "Jan", name: "Farhan Akhtar", type: "Birthday", year: "1974" },
  { day: 10, month: "Jan", name: "Hrithik Roshan", type: "Birthday", year: "1974" },
  { day: 16, month: "Jan", name: "Sidharth Malhotra", type: "Birthday", year: "1985" },
  { day: 21, month: "Jan", name: "Sushant Singh Rajput", type: "Birthday", year: "1986" },
  { day: 27, month: "Jan", name: "Bobby Deol", type: "Birthday", year: "1969" },
  
  // February
  { day: 1, month: "Feb", name: "Jackie Shroff", type: "Birthday", year: "1957" },
  { day: 5, month: "Feb", name: "Abhishek Bachchan", type: "Birthday", year: "1976" },
  { day: 6, month: "Feb", name: "Lata Mangeshkar", type: "Death", year: "2022", description: "Nightingale of India" },
  { day: 24, month: "Feb", name: "Sridevi", type: "Death", year: "2018", description: "First Female Superstar" },
  { day: 25, month: "Feb", name: "Shahid Kapoor", type: "Birthday", year: "1981" },

  // March
  { day: 2, month: "Mar", name: "Tiger Shroff", type: "Birthday", year: "1990" },
  { day: 6, month: "Mar", name: "Janhvi Kapoor", type: "Birthday", year: "1997" },
  { day: 12, month: "Mar", name: "Shreya Ghoshal", type: "Birthday", year: "1984" },
  { day: 14, month: "Mar", name: "Aamir Khan", type: "Birthday", year: "1965" },
  { day: 15, month: "Mar", name: "Alia Bhatt", type: "Birthday", year: "1993" },
  { day: 21, month: "Mar", name: "Rani Mukerji", type: "Birthday", year: "1978" },
  { day: 24, month: "Mar", name: "Emraan Hashmi", type: "Birthday", year: "1979" },

  // April
  { day: 2, month: "Apr", name: "Ajay Devgn", type: "Birthday", year: "1969" },
  { day: 9, month: "Apr", name: "Jaya Bachchan", type: "Birthday", year: "1948" },
  { day: 14, month: "Apr", name: "Ranbir & Alia", type: "Marriage", year: "2022" },
  { day: 20, month: "Apr", name: "Abhishek & Aishwarya", type: "Marriage", year: "2007" },
  { day: 24, month: "Apr", name: "Varun Dhawan", type: "Birthday", year: "1987" },
  { day: 29, month: "Apr", name: "Irrfan Khan", type: "Death", year: "2020", description: "Global Icon" },
  { day: 30, month: "Apr", name: "Rishi Kapoor", type: "Death", year: "2020" },

  // May
  { day: 1, month: "May", name: "Anushka Sharma", type: "Birthday", year: "1988" },
  { day: 8, month: "May", name: "Sonam & Anand", type: "Marriage", year: "2018" },
  { day: 15, month: "May", name: "Madhuri Dixit", type: "Birthday", year: "1967" },
  { day: 19, month: "May", name: "Nawazuddin Siddiqui", type: "Birthday", year: "1974" },
  { day: 25, month: "May", name: "Karan Johar", type: "Birthday", year: "1972" },
  { day: 30, month: "May", name: "Paresh Rawal", type: "Birthday", year: "1955" },

  // June
  { day: 1, month: "Jun", name: "Nargis", type: "Birthday", year: "1929" },
  { day: 2, month: "Jun", name: "Sonakshi Sinha", type: "Birthday", year: "1987" },
  { day: 8, month: "Jun", name: "Shilpa Shetty", type: "Birthday", year: "1975" },
  { day: 9, month: "Jun", name: "Sonam Kapoor", type: "Birthday", year: "1985" },
  { day: 14, month: "Jun", name: "Sushant Singh Rajput", type: "Death", year: "2020" },
  { day: 16, month: "Jun", name: "Mithun Chakraborty", type: "Birthday", year: "1950" },
  { day: 25, month: "Jun", name: "Karisma Kapoor", type: "Birthday", year: "1974" },

  // July
  { day: 6, month: "Jul", name: "Ranveer Singh", type: "Birthday", year: "1985" },
  { day: 7, month: "Jul", name: "Dilip Kumar", type: "Death", year: "2021", description: "Tragedy King" },
  { day: 16, month: "Jul", name: "Katrina Kaif", type: "Birthday", year: "1983" },
  { day: 18, month: "Jul", name: "Priyanka Chopra", type: "Birthday", year: "1982" },
  { day: 29, month: "Jul", name: "Sanjay Dutt", type: "Birthday", year: "1959" },
  { day: 31, month: "Jul", name: "Kiara Advani", type: "Birthday", year: "1992" },

  // August
  { day: 4, month: "Aug", name: "Kishore Kumar", type: "Birthday", year: "1929" },
  { day: 5, month: "Aug", name: "Kajol", type: "Birthday", year: "1974" },
  { day: 16, month: "Aug", name: "Saif Ali Khan", type: "Birthday", year: "1970" },
  { day: 20, month: "Aug", name: "Randeep Hooda", type: "Birthday", year: "1976" },

  // September
  { day: 4, month: "Sep", name: "Rishi Kapoor", type: "Birthday", year: "1952" },
  { day: 9, month: "Sep", name: "Akshay Kumar", type: "Birthday", year: "1967" },
  { day: 14, month: "Sep", name: "Ayushmann Khurrana", type: "Birthday", year: "1984" },
  { day: 21, month: "Sep", name: "Kareena Kapoor", type: "Birthday", year: "1980" },
  { day: 28, month: "Sep", name: "Ranbir Kapoor", type: "Birthday", year: "1982" },
  { day: 28, month: "Sep", name: "Lata Mangeshkar", type: "Birthday", year: "1929" },

  // October
  { day: 10, month: "Oct", name: "Rekha", type: "Birthday", year: "1954" },
  { day: 11, month: "Oct", name: "Amitabh Bachchan", type: "Birthday", year: "1942" },
  { day: 16, month: "Oct", name: "Hema Malini", type: "Birthday", year: "1948" },
  { day: 16, month: "Oct", name: "Saif & Kareena", type: "Marriage", year: "2012" },
  { day: 22, month: "Oct", name: "Parineeti Chopra", type: "Birthday", year: "1988" },
  { day: 26, month: "Oct", name: "Raveena Tandon", type: "Birthday", year: "1974" },

  // November
  { day: 1, month: "Nov", name: "Aishwarya Rai", type: "Birthday", year: "1973" },
  { day: 2, month: "Nov", name: "Shah Rukh Khan", type: "Birthday", year: "1965" },
  { day: 4, month: "Nov", name: "Tabu", type: "Birthday", year: "1971" },
  { day: 13, month: "Nov", name: "Juhi Chawla", type: "Birthday", year: "1967" },
  { day: 14, month: "Nov", name: "Deepika & Ranveer", type: "Marriage", year: "2018" },
  { day: 22, month: "Nov", name: "Kartik Aaryan", type: "Birthday", year: "1990" },
  
  // December
  { day: 8, month: "Dec", name: "Dharmendra", type: "Birthday", year: "1935" },
  { day: 9, month: "Dec", name: "Katrina & Vicky", type: "Marriage", year: "2021" },
  { day: 11, month: "Dec", name: "Anushka & Virat", type: "Marriage", year: "2017" },
  { day: 12, month: "Dec", name: "Rajinikanth", type: "Birthday", year: "1950" },
  { day: 17, month: "Dec", name: "John Abraham", type: "Birthday", year: "1972" },
  { day: 21, month: "Dec", name: "Govinda", type: "Birthday", year: "1963" },
  { day: 24, month: "Dec", name: "Anil Kapoor", type: "Birthday", year: "1956" },
  { day: 27, month: "Dec", name: "Salman Khan", type: "Birthday", year: "1965" },
  { day: 29, month: "Dec", name: "Twinkle Khanna", type: "Birthday", year: "1973" },
];

interface FilmEra {
  decade: string;
  title: string;
  description: string;
  keyMovies: string[];
  keyStars: string[];
  color: string;
}

const FILM_HISTORY_DATA: FilmEra[] = [
  {
    decade: "1950s",
    title: "The Golden Age",
    description: "A period of nation-building, social realism, and timeless melodies. Cinema became the voice of a newly independent India.",
    keyMovies: ["Mother India", "Mughal-e-Azam", "Pyaasa", "Awaara", "Naya Daur", "Do Bigha Zamin", "Shree 420"],
    keyStars: ["Raj Kapoor", "Dilip Kumar", "Dev Anand", "Nargis", "Madhubala", "Guru Dutt", "Meena Kumari", "Balraj Sahni"],
    color: "border-yellow-600"
  },
  {
    decade: "1960s",
    title: "Romance, Color & Kashmir",
    description: "The era shifted towards romantic escapism, shooting in exotic locations, and the rise of India's first superstar.",
    keyMovies: ["Mughal-e-Azam (Color)", "Guide", "Sangam", "Aradhana", "Teesri Manzil", "Waqt", "Padosan"],
    keyStars: ["Shammi Kapoor", "Rajesh Khanna", "Sharmila Tagore", "Vyjayanthimala", "Sadhana", "Sunil Dutt", "Waheeda Rehman", "Manoj Kumar"],
    color: "border-pink-500"
  },
  {
    decade: "1970s",
    title: "The Angry Young Man",
    description: "Reflecting social unrest and frustration with the system, this decade birthed the action hero and the masala genre.",
    keyMovies: ["Sholay", "Deewaar", "Zanjeer", "Amar Akbar Anthony", "Bobby", "Anand", "Don"],
    keyStars: ["Amitabh Bachchan", "Dharmendra", "Hema Malini", "Rishi Kapoor", "Vinod Khanna", "Rekha", "Sanjeev Kumar", "Shabana Azmi", "Zeenat Aman"],
    color: "border-red-600"
  },
  {
    decade: "1980s",
    title: "Action, Disco & Art Cinema",
    description: "A mix of hard-hitting revenge dramas, the disco wave, and the parallel cinema movement gaining ground.",
    keyMovies: ["Disco Dancer", "Mr. India", "Qayamat Se Qayamat Tak", "Umrao Jaan", "Arth", "Ram Lakhan", "Hero"],
    keyStars: ["Mithun Chakraborty", "Sridevi", "Anil Kapoor", "Sunny Deol", "Naseeruddin Shah", "Smita Patil", "Sanjay Dutt", "Jackie Shroff"],
    color: "border-purple-500"
  },
  {
    decade: "1990s",
    title: "The Three Khans & NRI Romance",
    description: "Family values returned with glossy romances, and the Khans began their dominance over the box office.",
    keyMovies: ["DDLJ", "Hum Aapke Hain Koun..!", "Kuch Kuch Hota Hai", "Dil To Pagal Hai", "Border", "Andaz Apna Apna", "Rangeela"],
    keyStars: ["Shah Rukh Khan", "Salman Khan", "Aamir Khan", "Madhuri Dixit", "Kajol", "Govinda", "Karisma Kapoor", "Akshay Kumar", "Juhi Chawla"],
    color: "border-blue-500"
  },
  {
    decade: "2000s",
    title: "Going Global & The Multiplex Era",
    description: "Experimental storytelling, sleek production values, and the rise of urban-centric cinema.",
    keyMovies: ["Lagaan", "Dil Chahta Hai", "Kabhi Khushi Kabhie Gham", "3 Idiots", "Rang De Basanti", "Munna Bhai MBBS", "Jab We Met"],
    keyStars: ["Hrithik Roshan", "Aishwarya Rai", "Kareena Kapoor", "Preity Zinta", "Abhishek Bachchan", "Shahid Kapoor", "Priyanka Chopra", "Saif Ali Khan"],
    color: "border-teal-500"
  },
  {
    decade: "2010s",
    title: "Content is King & The 100 Crore Club",
    description: "Bio-pics, small-town stories, and women-centric films found massive success alongside blockbusters.",
    keyMovies: ["Dangal", "Gangs of Wasseypur", "Queen", "Bajrangi Bhaijaan", "Baahubali", "Zindagi Na Milegi Dobara", "Barfi!"],
    keyStars: ["Ranbir Kapoor", "Deepika Padukone", "Ranveer Singh", "Kangana Ranaut", "Alia Bhatt", "Ayushmann Khurrana", "Varun Dhawan", "Shraddha Kapoor"],
    color: "border-orange-500"
  },
  {
    decade: "2020s",
    title: "The Pan-India Shift",
    description: "Boundaries blurred as South Indian cinema and Bollywood merged into a massive Indian film industry.",
    keyMovies: ["RRR", "Pathaan", "Jawan", "KGF 2", "Animal", "12th Fail", "Stree 2"],
    keyStars: ["Shah Rukh Khan (Return)", "Prabhas", "Allu Arjun", "Kiara Advani", "Kartik Aaryan", "Triptii Dimri", "Vikrant Massey", "Vicky Kaushal"],
    color: "border-emerald-500"
  }
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- Interfaces ---

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

const Archive: React.FC = () => {
  // View State
  const [activeTab, setActiveTab] = useState<'geography' | 'calendar' | 'history'>('geography');
  const [searchQuery, setSearchQuery] = useState('');

  // Interaction State
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  // Load Interactions
  useEffect(() => {
    const savedLikes = localStorage.getItem('mmm_archive_map_likes');
    const savedComments = localStorage.getItem('mmm_archive_map_comments');
    
    setLikes(savedLikes ? parseInt(savedLikes) : 0);
    setComments(savedComments ? JSON.parse(savedComments) : []);
    setHasLiked(false); 
  }, []);

  // --- Search Logic ---
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { geoHits: [], calendarHits: [], historyHits: [] };
    const lowerQ = searchQuery.toLowerCase();

    const geoHits = Object.entries(STAR_MAP_DATA).flatMap(([state, actors]) => 
        actors.filter(actor => actor.toLowerCase().includes(lowerQ)).map(actor => ({ state, actor }))
    );

    const calendarHits = STAR_EVENTS.filter(event => 
        event.name.toLowerCase().includes(lowerQ) || 
        event.description?.toLowerCase().includes(lowerQ)
    );

    const historyHits = FILM_HISTORY_DATA.filter(era => 
        era.decade.toLowerCase().includes(lowerQ) ||
        era.title.toLowerCase().includes(lowerQ) ||
        era.keyMovies.some(m => m.toLowerCase().includes(lowerQ)) ||
        era.keyStars.some(s => s.toLowerCase().includes(lowerQ))
    );

    return { geoHits, calendarHits, historyHits };
  };

  const { geoHits, calendarHits, historyHits } = getSearchResults();
  const isSearching = searchQuery.trim().length > 0;

  // --- Interaction Handlers ---

  const handleLike = () => {
      if (hasLiked) return;
      const newLikes = likes + 1;
      setLikes(newLikes);
      setHasLiked(true);
      localStorage.setItem('mmm_archive_map_likes', newLikes.toString());
  };

  const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      
      const newCommentObj: Comment = {
          id: Date.now().toString(),
          author: 'Movie Buff',
          text: commentText,
          date: new Date().toLocaleDateString()
      };
      
      const updatedComments = [newCommentObj, ...comments];
      setComments(updatedComments);
      localStorage.setItem('mmm_archive_map_comments', JSON.stringify(updatedComments));
      setCommentText('');
  };

  const handleShare = async () => {
     if (navigator.share) {
        try {
           await navigator.share({ 
               title: `MMM - Bollywood Archive`, 
               text: `Check out the Bollywood Archive on Manit Movie Minutes!` 
           });
        } catch (e) { console.debug(e); }
     } else {
        alert('Link copied to clipboard!');
     }
  };

  const StarMapView = () => {
    const sortedStates = Object.entries(STAR_MAP_DATA).sort((a, b) => b[1].length - a[1].length);
    const maxCount = sortedStates[0][1].length;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
            <h3 className="text-xl font-bold text-white mb-2">🇮🇳 The Geography of Stardom</h3>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
               From Punjab's da-puttars to Mumbai's homegrown talent, explore where your favorite Bollywood icons trace their roots.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedStates.map(([state, actors]) => {
               const intensity = actors.length / maxCount;
               let bgColor = "bg-slate-800";
               let borderColor = "border-slate-700";
               
               if (intensity > 0.7) { bgColor = "bg-red-900/30"; borderColor = "border-red-500/50"; }
               else if (intensity > 0.4) { bgColor = "bg-orange-900/30"; borderColor = "border-orange-500/50"; }
               else if (intensity > 0.2) { bgColor = "bg-yellow-900/20"; borderColor = "border-yellow-500/30"; }

               return (
                  <div key={state} className={`relative rounded-xl border ${borderColor} ${bgColor} p-5 transition-all hover:scale-[1.02] group overflow-hidden`}>
                     <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-bold text-white">{state}</h4>
                        <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-300 border border-slate-700">
                           {actors.length} Stars
                        </span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {actors.slice(0, 5).map(actor => (
                           <span key={actor} className="text-xs px-2 py-0.5 bg-slate-900/60 rounded text-slate-300 whitespace-nowrap border border-slate-700/50">
                              {actor}
                           </span>
                        ))}
                        {actors.length > 5 && (
                           <span className="text-xs text-brand-accent font-bold pt-1">+{actors.length - 5} more</span>
                        )}
                     </div>
                     <div className="absolute inset-0 bg-slate-900/95 flex flex-col justify-center px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center overflow-y-auto">
                        <p className="text-brand-primary font-bold text-xs uppercase tracking-widest mb-2">{state} Legacy</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{actors.join(", ")}</p>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
    );
  };

  const StarCalendarView = () => {
     // Group events by month index for sorting
     const eventsByMonth = MONTHS.map((month) => {
        return {
           month,
           events: STAR_EVENTS.filter(e => e.month === month).sort((a, b) => a.day - b.day)
        };
     }).filter(g => g.events.length > 0);

     return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
            <h3 className="text-xl font-bold text-white mb-2">📅 Star Almanac</h3>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
               Important dates in Bollywood history: Birthdays, Anniversaries, and Remembrances.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsByMonth.map((group) => (
               <div key={group.month} className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                     <h4 className="font-bold text-white text-lg">{group.month}</h4>
                     <span className="text-xs text-slate-500 uppercase tracking-widest">{group.events.length} Events</span>
                  </div>
                  <div className="p-2">
                     {group.events.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 hover:bg-slate-700/50 rounded-lg transition-colors border-b border-slate-700/30 last:border-0">
                           <div className="flex-shrink-0 w-10 h-10 bg-slate-900 rounded-lg flex flex-col items-center justify-center border border-slate-600">
                              <span className="text-xs font-bold text-slate-400">{event.month}</span>
                              <span className="text-sm font-bold text-white leading-none">{event.day}</span>
                           </div>
                           <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                 <h5 className="font-bold text-slate-200 text-sm">{event.name}</h5>
                                 <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{event.year}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className="text-xs">
                                     {event.type === 'Birthday' ? '🎂' : event.type === 'Marriage' ? '💍' : '🕯️'}
                                 </span>
                                 <span className={`text-xs font-medium ${event.type === 'Birthday' ? 'text-brand-secondary' : event.type === 'Marriage' ? 'text-pink-400' : 'text-slate-400'}`}>
                                     {event.type}
                                 </span>
                                 {event.description && <span className="text-[10px] text-slate-500">- {event.description}</span>}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
     );
  };

  const FilmHistoryView = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
            <h3 className="text-xl font-bold text-white mb-2">🎞️ Film History</h3>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
               A journey through the decades: From the Golden Age to the Pan-India phenomenon.
            </p>
         </div>

         <div className="relative border-l-2 border-slate-700 ml-4 md:ml-6 space-y-12 py-4">
            {FILM_HISTORY_DATA.map((era, idx) => (
               <div key={idx} className="relative pl-8 md:pl-10">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-slate-900 border-4 ${era.color} shadow-lg z-10`}></div>
                  
                  <div className={`bg-slate-800/60 rounded-xl border-l-4 ${era.color} p-6 hover:bg-slate-800 transition-colors shadow-lg`}>
                     <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                           <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700`}>{era.decade}</span>
                           <h3 className="text-2xl font-bold text-white mt-2">{era.title}</h3>
                        </div>
                     </div>
                     
                     <p className="text-slate-300 mb-6 leading-relaxed italic border-l-2 border-slate-700 pl-4">
                        {era.description}
                     </p>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Defining Movies</h4>
                           <div className="flex flex-wrap gap-2">
                              {era.keyMovies.map((movie, i) => (
                                 <span key={i} className="px-2 py-1 bg-slate-900/80 text-xs text-brand-secondary border border-slate-700 rounded">
                                    {movie}
                                 </span>
                              ))}
                           </div>
                        </div>
                        <div>
                           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Icons of the Era</h4>
                           <div className="flex flex-wrap gap-2">
                              {era.keyStars.map((star, i) => (
                                 <span key={i} className="px-2 py-1 bg-slate-700/50 text-xs text-slate-200 border border-slate-600 rounded">
                                    {star}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    );
  };

  const SearchResultsView = () => (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="flex items-center gap-2 mb-2">
             <span className="text-brand-accent font-bold">Search Results for:</span>
             <span className="text-white italic">"{searchQuery}"</span>
         </div>

         {/* Geography Results */}
         {geoHits.length > 0 && (
            <Card className="p-6 border-l-4 border-l-brand-primary">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <span>📍</span> Geography Matches
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {geoHits.map((hit, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                             <div>
                                <span className="text-white font-bold block text-lg">{hit.actor}</span>
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Hails from</span>
                             </div>
                             <span className="bg-slate-800 text-brand-primary px-3 py-1 rounded-full font-bold border border-slate-700">{hit.state}</span>
                        </div>
                    ))}
                </div>
            </Card>
         )}

         {/* Calendar Results */}
         {calendarHits.length > 0 && (
             <Card className="p-6 border-l-4 border-l-brand-secondary">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <span>📅</span> Calendar Matches
                </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calendarHits.map((event, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl border border-slate-600">
                                {event.type === 'Birthday' ? '🎂' : event.type === 'Marriage' ? '💍' : '🕯️'}
                             </div>
                             <div>
                                 <div className="font-bold text-white text-lg">{event.name}</div>
                                 <div className="text-sm text-slate-300 flex items-center gap-2">
                                     <span className={`${event.type === 'Birthday' ? 'text-brand-secondary' : event.type === 'Marriage' ? 'text-pink-400' : 'text-slate-400'} font-bold`}>{event.type}</span>
                                     <span className="text-slate-600">•</span>
                                     <span>{event.day} {event.month} {event.year}</span>
                                 </div>
                                 {event.description && <p className="text-xs text-slate-500 mt-1 italic">{event.description}</p>}
                             </div>
                        </div>
                    ))}
                 </div>
             </Card>
         )}

         {/* History Results */}
         {historyHits.length > 0 && (
            <Card className="p-6 border-l-4 border-l-emerald-500">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <span>🎞️</span> History Matches
                </h3>
                <div className="space-y-4">
                    {historyHits.map((era, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                             <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-bold text-white">{era.decade}: {era.title}</h4>
                             </div>
                             <p className="text-sm text-slate-300 italic mb-2">{era.description}</p>
                             <div className="flex flex-wrap gap-2">
                                {era.keyMovies.map((m, i) => (
                                   <span key={i} className={`text-[10px] px-2 py-0.5 rounded border border-slate-600 ${m.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-emerald-900/50 text-emerald-300 font-bold' : 'bg-slate-800 text-slate-400'}`}>{m}</span>
                                ))}
                                {era.keyStars.map((s, i) => (
                                   <span key={i} className={`text-[10px] px-2 py-0.5 rounded border border-slate-600 ${s.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-emerald-900/50 text-emerald-300 font-bold' : 'bg-slate-800 text-slate-400'}`}>{s}</span>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
            </Card>
         )}

         {geoHits.length === 0 && calendarHits.length === 0 && historyHits.length === 0 && (
             <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                 <div className="text-4xl mb-4">🔍</div>
                 <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
                 <p className="text-slate-400">We couldn't find any geography, calendar, or history events for "{searchQuery}".</p>
                 <Button onClick={() => setSearchQuery('')} className="mt-4" variant="secondary">Clear Search</Button>
             </div>
         )}
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto min-h-screen">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
             <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-4xl">🗄️</span> 
                The Archive
             </h2>
             <p className="text-slate-400 mt-1">The MMM Vault: Historical Data & Analytics</p>
          </div>
       </div>

       {/* Search Bar */}
       <div className="max-w-2xl mx-auto mb-8 relative z-10">
          <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative">
                  <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search archive (e.g., Deepika, 1970s, Sholay, Punjab)..."
                      className="w-full pl-12 py-3 bg-slate-900 border-slate-700 focus:border-slate-500 shadow-xl"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                  </div>
                  {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  )}
              </div>
          </div>
       </div>

       {/* Tabs (Only show if not searching) */}
       {!isSearching && (
           <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-2">
              <div className="bg-slate-800 p-1 rounded-full inline-flex border border-slate-700 shadow-lg">
                 <button 
                   onClick={() => setActiveTab('geography')}
                   className={`px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'geography' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                 >
                   Geography
                 </button>
                 <button 
                   onClick={() => setActiveTab('calendar')}
                   className={`px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                 >
                   Star Calendar
                 </button>
                 <button 
                   onClick={() => setActiveTab('history')}
                   className={`px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                 >
                   Film History
                 </button>
              </div>
           </div>
       )}

       <div className="space-y-8">
           {isSearching ? (
               <SearchResultsView />
           ) : (
               <>
                 {activeTab === 'geography' && <StarMapView />}
                 {activeTab === 'calendar' && <StarCalendarView />}
                 {activeTab === 'history' && <FilmHistoryView />}
               </>
           )}

           {/* Shared Interaction Bar */}
           <Card className="p-4 border-t-4 border-t-brand-accent mt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-6">
                      <button 
                        onClick={handleLike}
                        className={`flex items-center gap-2 group transition-all ${hasLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
                      >
                          <svg className={`w-6 h-6 ${hasLiked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="font-bold text-lg">{likes}</span>
                      </button>

                      <button 
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
                      >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="font-bold text-lg">{comments.length}</span>
                      </button>

                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors"
                      >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span className="text-sm font-semibold">Share</span>
                      </button>
                  </div>
              </div>

              {/* Comments Section */}
              {showComments && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                      <h4 className="text-sm font-bold text-slate-300 uppercase mb-4">Discussion (Archive)</h4>
                      
                      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                          {comments.length > 0 ? (
                              comments.map(c => (
                                  <div key={c.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                      <div className="flex justify-between mb-1">
                                          <span className="text-xs font-bold text-brand-secondary">{c.author}</span>
                                          <span className="text-xs text-slate-500">{c.date}</span>
                                      </div>
                                      <p className="text-sm text-slate-300">{c.text}</p>
                                  </div>
                              ))
                          ) : (
                              <p className="text-sm text-slate-500 italic">No comments yet. Start the conversation!</p>
                          )}
                      </div>

                      <form onSubmit={handleAddComment} className="flex gap-3">
                          <Input 
                            value={commentText} 
                            onChange={(e) => setCommentText(e.target.value)} 
                            placeholder="Add your thoughts..."
                            className="flex-grow text-sm py-2"
                          />
                          <Button type="submit" className="text-sm py-2 px-4">Post</Button>
                      </form>
                  </div>
              )}
           </Card>
       </div>
    </div>
  );
};

export default Archive;
