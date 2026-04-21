import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: catData } = await supabase.from('categories').select('name');
      if (catData) {
        setCategories(["All", ...catData.map(c => c.name)]);
      }

      const { data: itemData } = await supabase
        .from('menu_items')
        .select(`
          id, name, price, description, image_url, is_featured,
          categories ( name ),
          menu_item_ingredients ( ingredients ( name ) )
        `);
      
      if (itemData) {
        const formattedData = itemData.map(item => ({
          id: item.id,
          name: item.name,
          category: item.categories?.name,
          price: item.price,
          description: item.description,
          ingredients: item.menu_item_ingredients?.map(mi => mi.ingredients?.name) || [],
          image: item.image_url,
          featured: item.is_featured
        }));
        setMenuItems(formattedData);
      }
    };
    
    fetchMenu();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="menu-section">
      <div className="section-header reveal-up">
        <span className="subtitle">Exploration</span>
        <h2>Our <span>Menu</span></h2>
        <div className="search-container glass">
          <input 
            type="text" 
            placeholder="Search our flavors..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-wrapper">
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="scroll-btn left" 
              onClick={() => scroll('left')}
            >
              <ChevronLeft size={20} />
            </motion.button>
          )}
        </AnimatePresence>
        
        <motion.div 
          className="filter-container"
          ref={scrollRef}
          onScroll={handleScroll}
          whileTap={{ cursor: "grabbing" }}
        >
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <AnimatePresence>
          {canScrollRight && (
            <motion.button 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="scroll-btn right" 
              onClick={() => scroll('right')}
            >
              <ChevronRight size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <motion.div layout className="menu-grid">
        <AnimatePresence mode='popLayout'>
          {filteredItems.map((item, index) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              key={item.id} 
              className={`menu-card ${item.featured ? 'featured-card animate-float' : ''}`}
            >
              <div className="card-image shimmer">
                <img src={item.image} alt={item.name} />
                <div className="card-overlay" onClick={() => setSelectedItem(item)}>
                  <Info size={24} />
                </div>
                {item.featured && <span className="featured-badge">Chef's Choice</span>}
              </div>
              <div className="card-info">
                <div className="card-header">
                  <h3>{item.name}</h3>
                  <span className="price">${item.price.toFixed(2)}</span>
                </div>
                <p>{item.description}</p>
                <button className="details-btn" onClick={() => setSelectedItem(item)}>
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="modal-content glass"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setSelectedItem(null)}>&times;</button>
              <div className="modal-body">
                <div className="modal-img">
                  <img src={selectedItem.image} alt={selectedItem.name} />
                </div>
                <div className="modal-info">
                  <span className="category-tag">{selectedItem.category}</span>
                  <h2>{selectedItem.name}</h2>
                  <p className="modal-desc">{selectedItem.description}</p>
                  
                  <div className="ingredients">
                    <h4>Ingredients</h4>
                    <div className="tags">
                      {selectedItem.ingredients.map(ing => (
                        <span key={ing} className="tag">{ing}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <span className="modal-price">${selectedItem.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        .menu-section {
          padding: 100px 10%;
          background: #0d0d0d;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-header h2 {
          font-size: 3.5rem;
        }

        .section-header h2 span {
          color: var(--neon-red);
        }

        .search-container {
          max-width: 500px;
          margin: 30px auto 0;
          padding: 5px 10px;
          border-radius: 50px;
          display: flex;
          align-items: center;
        }

        .search-container input {
          width: 100%;
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: white;
          font-family: inherit;
          font-size: 1rem;
          outline: none;
        }

        .search-container input::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .filter-wrapper {
          position: relative;
          margin-bottom: 60px;
          padding: 10px 0;
          overflow: hidden;
        }

        .featured-card {
           border-color: var(--neon-red) !important;
           box-shadow: 0 0 30px rgba(255, 49, 49, 0.15);
        }

        .featured-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: var(--neon-red);
          color: white;
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          z-index: 5;
          box-shadow: 0 0 15px rgba(255, 49, 49, 0.5);
        }

        .filter-wrapper::before,
        .filter-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          width: 80px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .filter-wrapper::before {
          left: 0;
          background: linear-gradient(90deg, #0d0d0d 10%, transparent 100%);
        }

        .filter-wrapper::after {
          right: 0;
          background: linear-gradient(-90deg, #0d0d0d 10%, transparent 100%);
        }

        .scroll-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: #111;
          color: var(--ghost-white);
          border: 1px solid var(--glass-border);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .scroll-btn:hover {
          background: var(--neon-red);
          color: white;
          border-color: var(--neon-red);
          box-shadow: 0 0 10px var(--accent-red-glow);
        }

        .scroll-btn.left {
          left: 10px;
        }

        .scroll-btn.right {
          right: 10px;
        }

        .filter-container {
          display: flex;
          gap: 15px;
          padding: 10px 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          justify-content: center; /* Center by default */
        }

        @media (max-width: 768px) {
          .filter-container {
            justify-content: flex-start;
            padding: 10px 40px; /* More padding on mobile for the fade effect */
          }
          .scroll-btn {
            display: none; /* Mobile users prefer swiping naturally */
          }
        }

        .filter-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        .filter-btn {
          flex: 0 0 auto;
          padding: 10px 28px;
          border: 1px solid var(--glass-border);
          color: var(--muted-gray);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.85rem;
          transition: var(--transition);
          border-radius: 50px;
          cursor: pointer;
          white-space: nowrap;
        }

        .filter-btn:hover, .filter-btn.active {
          border-color: var(--neon-red);
          color: var(--ghost-white);
          background: var(--accent-red-glow);
          box-shadow: 0 0 15px rgba(255, 49, 49, 0.2);
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 30px;
        }

        .menu-card {
          background: var(--bg-card);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          transition: var(--transition);
          display: flex;
          height: 200px;
        }

        @media (max-width: 600px) {
          .menu-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .menu-card {
            height: 160px;
          }
        }

        .menu-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 49, 49, 0.3);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .card-image {
          position: relative;
          width: 180px;
          flex-shrink: 0;
          overflow: hidden;
        }

        @media (max-width: 600px) {
          .card-image {
            width: 130px;
          }
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-card:hover .card-image img {
          transform: scale(1.1);
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
          cursor: pointer;
        }

        .card-image:hover .card-overlay {
          opacity: 1;
        }

        .card-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .card-header h3 {
          font-size: 1.1rem;
          letter-spacing: 0.5px;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price {
          color: var(--neon-red);
          font-weight: 700;
          font-size: 1rem;
          white-space: nowrap;
        }

        .card-info p {
          color: var(--muted-gray);
          font-size: 0.85rem;
          line-height: 1.4;
          margin: 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .details-btn {
          width: fit-content;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid var(--neon-red);
          color: var(--neon-red);
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.7rem;
          transition: var(--transition);
        }

        .details-btn:hover {
          background: var(--neon-red);
          color: white;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 900px;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }

        .close-modal {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 2.5rem;
          color: white;
          z-index: 10;
        }

        .modal-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .modal-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          min-height: 400px;
        }

        .modal-info {
          padding: 60px 40px;
        }

        .category-tag {
          color: var(--neon-red);
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.8rem;
          margin-bottom: 10px;
          display: block;
        }

        .modal-info h2 {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .modal-desc {
          color: var(--muted-gray);
          line-height: 1.8;
          margin-bottom: 30px;
        }

        .ingredients h4 {
          margin-bottom: 15px;
          color: white;
        }

        .tags {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .tag {
          background: #222;
          padding: 6px 15px;
          border-radius: 4px;
          font-size: 0.8rem;
          color: #aaa;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--glass-border);
          padding-top: 30px;
        }

        .modal-price {
          font-size: 2rem;
          font-weight: 700;
          font-family: 'Anton', sans-serif;
        }

        .order-btn-modal {
          background: var(--neon-red);
          color: white;
          padding: 15px 40px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
        }

        @media (max-width: 850px) {
          .modal-body {
            grid-template-columns: 1fr;
          }
          .modal-info {
            padding: 30px;
          }
          .modal-img img {
            min-height: 250px;
          }
        }
      `}</style>
    </section>
  );
};

export default Menu;
