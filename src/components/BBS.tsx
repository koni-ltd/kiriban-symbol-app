import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Post {
  id: number;
  name: string;
  body: string;
  created_at: string;
}

const formatPostDate = (dateString: string) => {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}`;
};

export const BBS: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('bbs_posts')
      .select('*')
      .order('id', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching posts:', error);
    } else if (data) {
      setPosts(data as Post[]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setIsLoading(true);

    const postPayload = name.trim() 
      ? { name: name.trim(), body: trimmedMessage }
      : { body: trimmedMessage };

    const { error } = await supabase
      .from('bbs_posts')
      .insert([postPayload]);

    setIsLoading(false);

    if (error) {
      console.error('Error saving post:', error);
      alert('書き込みに失敗しました。');
      return;
    }

    setName('');
    setMessage('');
    fetchPosts();
  };

  return (
    <div style={{ backgroundColor: '#fff' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#d6d6d6',
          borderStyle: 'solid',
          borderWidth: '2px',
          borderColor: '#ffffff #808080 #808080 #ffffff',
          boxShadow: 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #404040',
          padding: '8px',
        }}
      >
        <fieldset style={{ border: '0px solid #808080', padding: '8px' }}>
          <table border={0} cellPadding={4} cellSpacing={0} width="100%">
            <tbody>
              <tr>
                <td width="80" style={{ verticalAlign: 'top', textAlign: 'left', paddingBottom: '10px' }}>
                  <label htmlFor="bbs-name">お名前</label>
                </td>
                <td style={{ paddingBottom: '10px' }}>
                  <input
                    id="bbs-name"
                    type="text"
                    size={36}
                    maxLength={30}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      borderStyle: 'solid',
                      borderWidth: '2px',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      backgroundColor: '#fff',
                      padding: '2px 4px',
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top', textAlign: 'left' }}>
                  <label htmlFor="bbs-message">本文</label>
                </td>
                <td>
                  <textarea
                    id="bbs-message"
                    rows={4}
                    cols={60}
                    maxLength={300}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      borderStyle: 'solid',
                      borderWidth: '2px',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      backgroundColor: '#fff',
                      padding: '2px 4px',
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      fontSize: '12pt',
                      padding: '3px 12px',
                      backgroundColor: '#c0c0c0',
                      borderStyle: 'solid',
                      borderWidth: '2px',
                      borderColor: '#ffffff #808080 #808080 #ffffff',
                      boxShadow: 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #404040',
                      color: isLoading ? '#888' : '#000',
                    }}
                  >
                    {isLoading ? '書き込み中...' : '書き込む'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </fieldset>
      </form>

      <div style={{ marginTop: '16px', border: '1px solid #b9b9b9' }}>
        {posts.map((post, index) => (
          <div
            key={post.id}
            style={{
              borderBottom: index === posts.length - 1 ? 'none' : '1px solid #b9b9b9',
              padding: '10px 12px 14px',
            }}
          >
            <div>
              <a href={`#post-${post.id}`} id={`post-${post.id}`} style={{ color: '#0b6f24', textDecoration: 'none' }}>{post.id}</a>
              <span>: </span>
              <span style={{ marginRight: '8px' }}>[{post.name}]</span>
              <span>{formatPostDate(post.created_at)}</span>
            </div>
            <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{post.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
