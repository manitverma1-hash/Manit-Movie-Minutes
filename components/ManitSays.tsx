
import React, { useState } from 'react';
import type { ManitContent, Language, UserComment } from '../types';
import Card from './shared/Card';
import Button from './shared/Button';
import Input from './shared/Input';

interface ManitSaysProps {
  language: Language;
}

// Mock initial data
const initialPosts: ManitContent[] = [
  {
    id: '1',
    type: 'review',
    title: 'Animal: A Masterpiece or Misstep?',
    content: "Sandeep Reddy Vanga's latest outing is nothing short of a cinematic hurricane. While the performances are stellar, especially Ranbir Kapoor who delivers a career-best act of unhinged intensity, the narrative choices leave you conflicted. It's visceral, violent, and unapologetically bold. A must-watch for the craft, even if the morality makes you flinch.",
    rating: 4.5,
    date: '2023-12-05',
    tags: ['Review', 'Ranbir Kapoor', 'Action'],
    comments: [
      { id: 'c1', author: 'Rohan', text: 'Totally agree! Ranbir was beast mode.', date: '2023-12-06' },
      { id: 'c2', author: 'Priya', text: 'Too much violence for me, but great acting.', date: '2023-12-07' }
    ]
  },
  {
    id: '2',
    type: 'video',
    title: 'Public Reaction: Dunki vs Salaar',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder ID
    date: '2023-12-22',
    tags: ['Vox Pop', 'Clash', 'Public Opinion'],
    comments: []
  },
  {
    id: '3',
    type: 'review',
    title: '12th Fail: The Heart of Cinema Returns',
    content: "Vidhu Vinod Chopra returns to form with this simplistic yet deeply moving tale of grit and determination. Vikrant Massey is a revelation. In an era of 500-Crore action spectacles, this film reminds us that a good story is the biggest special effect.",
    rating: 5,
    date: '2023-10-28',
    tags: ['Review', 'Inspiring', 'Must Watch'],
    comments: [
       { id: 'c3', author: 'Amit', text: 'Best movie of the year hands down.', date: '2023-10-29' }
    ]
  }
];

const ManitSays: React.FC<ManitSaysProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'reviews' | 'videos'>('all');
  const [posts, setPosts] = useState<ManitContent[]>(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  
  // Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'review' | 'video'>('review');
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Comment Form State
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const post: ManitContent = {
      id: Date.now().toString(),
      type: newType,
      title: newTitle,
      date: new Date().toISOString().split('T')[0],
      tags: ['New'],
      comments: [],
      ...(newType === 'review' ? { content: newContent, rating: Number(newRating) } : { videoUrl: newVideoUrl })
    };

    setPosts([post, ...posts]);
    setShowForm(false);
    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewRating('');
    setNewVideoUrl('');
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: UserComment = {
      id: Date.now().toString(),
      author: commentAuthor || 'Anonymous Fan',
      text: commentText,
      date: new Date().toISOString().split('T')[0]
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));

    setCommentText('');
    setCommentAuthor('');
  };

  const toggleComments = (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
    }
  };

  const filteredPosts = posts.filter(p => activeTab === 'all' || (activeTab === 'reviews' ? p.type === 'review' : p.type === 'video'));

  // Embed helper
  const getEmbedUrl = (url: string) => {
     // Simple check to convert standard YT links to embed
     if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/');
     }
     if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/');
     }
     return url; // Assume it's already an embed link or let it fail gracefully for demo
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Profile */}
      <div className="bg-slate-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 border border-slate-700 shadow-xl">
         <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-primary flex items-center justify-center text-4xl font-bold text-white shadow-lg flex-shrink-0 border-4 border-slate-900">
            MS
         </div>
         <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Manit Says</h1>
            <p className="text-brand-accent text-lg font-medium mb-3">Film Critic & Anchor</p>
            <p className="text-slate-300 max-w-2xl">
               Unfiltered reviews, honest opinions, and direct-from-the-public reactions. 
               Welcome to my personal corner where we dissect cinema beyond the box office numbers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
               <Button onClick={() => setShowForm(!showForm)} variant="secondary" className="text-sm">
                  {showForm ? 'Cancel Post' : '+ Add New Post'}
               </Button>
            </div>
         </div>
      </div>

      {/* Add Post Form */}
      {showForm && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4">
           <Card className="p-6 border-brand-accent/30 bg-slate-800/80">
              <h3 className="text-xl font-bold mb-4 text-white">Create New Post</h3>
              <form onSubmit={handleAddPost} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm text-slate-400 mb-1">Title</label>
                       <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Enter post title" required />
                    </div>
                    <div>
                       <label className="block text-sm text-slate-400 mb-1">Type</label>
                       <select 
                          value={newType} 
                          onChange={e => setNewType(e.target.value as 'review' | 'video')}
                          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                       >
                          <option value="review">Review</option>
                          <option value="video">Video (Vox Pop)</option>
                       </select>
                    </div>
                 </div>

                 {newType === 'review' ? (
                    <>
                       <div>
                          <label className="block text-sm text-slate-400 mb-1">Review Content</label>
                          <textarea 
                             value={newContent} 
                             onChange={e => setNewContent(e.target.value)} 
                             className="w-full h-32 bg-slate-700 border border-slate-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                             placeholder="Write your thoughts..."
                          ></textarea>
                       </div>
                       <div>
                          <label className="block text-sm text-slate-400 mb-1">Rating (0-5)</label>
                          <Input type="number" min="0" max="5" step="0.5" value={newRating} onChange={e => setNewRating(e.target.value)} placeholder="4.5" />
                       </div>
                    </>
                 ) : (
                    <div>
                       <label className="block text-sm text-slate-400 mb-1">YouTube Video URL</label>
                       <Input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
                    </div>
                 )}
                 
                 <Button type="submit">Publish Post</Button>
              </form>
           </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-6 w-fit mx-auto md:mx-0">
         {['all', 'reviews', 'videos'].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-6 py-2 rounded-md text-sm font-semibold capitalize transition-all ${
                  activeTab === tab 
                  ? 'bg-brand-primary text-white shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
               }`}
            >
               {tab}
            </button>
         ))}
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
         {filteredPosts.map((post) => (
            <Card key={post.id} className="flex flex-col h-full hover:border-brand-primary/40 transition-colors">
               <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                     <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${post.type === 'review' ? 'bg-purple-900 text-purple-200' : 'bg-red-900 text-red-200'}`}>
                        {post.type === 'review' ? '📝 Critic Review' : '🎥 Vox Pop'}
                     </span>
                     <span className="text-xs text-slate-500">{post.date}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                  
                  {post.type === 'review' && (
                     <>
                        <div className="mb-4 flex items-center">
                           {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < Math.floor(post.rating || 0) ? 'text-yellow-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                           ))}
                           <span className="ml-2 text-sm text-slate-300 font-bold">{post.rating}/5</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-grow line-clamp-4">
                           {post.content}
                        </p>
                     </>
                  )}

                  {post.type === 'video' && post.videoUrl && (
                     <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-4 border border-slate-700">
                        <iframe 
                           className="w-full h-full"
                           src={getEmbedUrl(post.videoUrl)}
                           title={post.title}
                           frameBorder="0"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                        ></iframe>
                     </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
                     <div className="flex gap-2">
                        {post.tags.map(tag => (
                           <span key={tag} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-full">#{tag}</span>
                        ))}
                     </div>
                     <button 
                       onClick={() => toggleComments(post.id)}
                       className="flex items-center text-xs text-brand-accent hover:text-white transition-colors"
                     >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        {post.comments.length} Comments
                     </button>
                  </div>

                  {/* Comments Section */}
                  {expandedPostId === post.id && (
                    <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in duration-200">
                       <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                          {post.comments.length > 0 ? (
                             post.comments.map(comment => (
                                <div key={comment.id} className="bg-slate-900/50 p-2 rounded text-sm">
                                   <div className="flex justify-between items-baseline mb-1">
                                      <span className="font-bold text-brand-secondary">{comment.author}</span>
                                      <span className="text-[10px] text-slate-500">{comment.date}</span>
                                   </div>
                                   <p className="text-slate-300">{comment.text}</p>
                                </div>
                             ))
                          ) : (
                             <p className="text-xs text-slate-500 text-center py-2">No comments yet. Be the first!</p>
                          )}
                       </div>
                       
                       <form onSubmit={(e) => handleAddComment(e, post.id)} className="space-y-2">
                          <Input 
                            value={commentAuthor}
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            placeholder="Your Name (Optional)"
                            className="text-xs py-1"
                          />
                          <div className="flex gap-2">
                             <Input 
                               value={commentText}
                               onChange={(e) => setCommentText(e.target.value)}
                               placeholder="Add a comment..."
                               className="text-xs py-1 flex-grow"
                             />
                             <Button type="submit" className="px-3 py-1 text-xs whitespace-nowrap">Post</Button>
                          </div>
                       </form>
                       <div className="mt-4 pt-2 border-t border-slate-700/50">
                          <p className="text-xs text-slate-400 text-center">
                              <span className="font-bold text-brand-primary">Disclaimer:</span> Opinions expressed in comments are solely of the individual and not views of Manit Movie Minutes.
                          </p>
                       </div>
                    </div>
                  )}
               </div>
            </Card>
         ))}
      </div>
    </div>
  );
};

export default ManitSays;
