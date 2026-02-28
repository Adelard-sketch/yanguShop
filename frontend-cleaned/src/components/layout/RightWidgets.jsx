import React from 'react';
import './RightWidgets.css';

export default function RightWidgets({ recently = [], suggestions = [] }){
  return (
    <aside className="right-widgets">
      <div className="widget">
        <h4>Recently Viewed</h4>
        {recently.length===0 ? <div className="empty">See your browsing history</div> : (
          recently.map(r=> (
            <div key={r._id} className="rv-item">{r.name}</div>
          ))
        )}
      </div>

      <div className="widget">
        <h4>Suggestions for You</h4>
        {suggestions.length===0 ? <div className="empty">Watch more</div> : (
          suggestions.map(s => <div key={s._id} className="rv-item">{s.name}</div>)
        )}
      </div>
    </aside>
  )
}
