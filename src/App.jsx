import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = {name: 'You', email: 'you@example.com'}; // Demo account; no login backend
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
const seed = [
  {id:'m1', title:'Calculus II textbook', category:'textbooks', condition:'used', price:320, description:'Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC student area, near the main cafeteria', photos:[photo('photo-1544947950-fa07a98d237f'),photo('photo-1494438639946-1ebd1d20bf85')], emoji:'📚'},
  {id:'m2', title:'Student desk lamp', category:'furniture', condition:'like-new', price:240, description:'Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.', status:'active', owner:'other', seller:'Mariam', sellerEmail:'mariam.seller@example.com', pickup:'GUC library entrance, weekdays after 1 PM', photos:[photo('photo-1555475384-a0aefc775412')], emoji:'💡'},
  {id:'m3', title:'Bluetooth headphones', category:'electronics', condition:'used', price:650, description:'Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.', status:'active', owner:'other', seller:'Omar', sellerEmail:'omar.seller@example.com', pickup:'Arrange a meetup at GUC Gate 3', photos:[photo('photo-1599955051125-571f47e04316'),photo('photo-1505740420928-5e560c06d30e'),photo('photo-1546435770-a3e426bf472b')], emoji:'🎧'},
  {id:'m4', title:'Engineering lab coat', category:'clothing', condition:'new', price:200, description:'White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'Meet at GUC main entrance, mornings', photos:[photo('photo-1542058186993-286fdce0b580')], emoji:'🥼'},
  {id:'m5', title:'Drawing tablet', category:'electronics', condition:'like-new', price:1450, description:'Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.', status:'active', owner:'other', seller:'Nour', sellerEmail:'nour.seller@example.com', pickup:'GUC design building reception', photos:[photo('photo-1671087709820-274fdd9ac67a')], emoji:'✏️'},
  {id:'m6', title:'Used storage shelf', category:'furniture', condition:'worn', price:390, description:'Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.', status:'active', owner:'other', seller:'Youssef', sellerEmail:'youssef.seller@example.com', pickup:'Collect from a public pickup point near GUC, by arrangement', photos:[photo('photo-1692195321701-1a454c79ab02'),photo('photo-1758279746549-d24f3784879d')], emoji:'🗄️'},
  {id:'m7', title:'MATH 201 workbook', category:'textbooks', condition:'used', price:140, description:'Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.', status:'sold', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC campus (previous listing)', photos:[photo('photo-1544947950-fa07a98d237f')], emoji:'📖'},
  {id:'m8', title:'Sketching kit', category:'other', condition:'like-new', price:180, description:'Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.', status:'active', owner:'other', seller:'Salma', sellerEmail:'salma.seller@example.com', pickup:'Meet outside the GUC architecture studios', photos:[photo('photo-1758521232691-613561977b6a'),photo('photo-1771366629879-8b3128ee62ca')], emoji:'🎨'},
];
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active'};
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
function findError(form){
 if(!form.title.trim())return 'Please complete the item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)) || Number(form.price)<0)return 'Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))return 'Choose a category.';
 if(!conditions.includes(form.condition))return 'Choose an item condition.';
 if(!['active','sold'].includes(form.status))return 'Choose a valid status.';
 return '';
}
function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}
export default function App(){
 const [items,setItems] = useState(saved);
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [conditionFilter,setConditionFilter] = useState('all');
 const [availability,setAvailability] = useState('all');
 const [minPrice,setMinPrice] = useState('');
 const [maxPrice,setMaxPrice] = useState('');
 const [filtersOpen,setFiltersOpen] = useState(false);
 const [sort,setSort] = useState('featured');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 const [compareIds,setCompareIds] = useState([]);
 const [comparisonOpen,setComparisonOpen] = useState(false);
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 useEffect(()=>setCompareIds(ids=>ids.filter(id=>items.some(item=>item.id===id && item.status==='active'))),[items]);
 useEffect(()=>{const onKey=e=>{if(e.key!=='Escape')return;if(editor)setEditor(null);else if(selected)setSelected(null);else if(comparisonOpen)setComparisonOpen(false);};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[comparisonOpen,selected,editor]);
 const compareItems = useMemo(()=>compareIds.map(id=>items.find(item=>item.id===id)).filter(item=>item&&item.status==='active'),[compareIds,items]);
 useEffect(()=>{if(comparisonOpen && compareItems.length<2)setComparisonOpen(false);},[comparisonOpen,compareItems.length]);
 function toggleCompare(id){const item=items.find(x=>x.id===id);if(!item || item.status==='sold')return;setCompareIds(ids=>ids.includes(id)?ids.filter(x=>x!==id):ids.length<3?[...ids,id]:ids);}
 const activeFilterCount = [category!=='all',conditionFilter!=='all',availability!=='all',minPrice!==''||maxPrice!==''].filter(Boolean).length;
 const listing = useMemo(()=>{
  const search = query.toLowerCase().trim();
  const lower = minPrice===''?null:Number(minPrice);
  const upper = maxPrice===''?null:Number(maxPrice);
  let a = items.filter(x =>
   (category==='all'||x.category===category) &&
   (conditionFilter==='all'||x.condition===conditionFilter) &&
   (availability==='all'||x.status===availability) &&
   (lower===null||!Number.isFinite(lower)||x.price>=lower) &&
   (upper===null||!Number.isFinite(upper)||x.price<=upper) &&
   `${x.title} ${x.category} ${x.description}`.toLowerCase().includes(search)
  );
  if(sort==='low')a.sort((a,b)=>a.price-b.price);
  if(sort==='high')a.sort((a,b)=>b.price-a.price);
  return a;
 },[items,category,conditionFilter,availability,minPrice,maxPrice,query,sort]);
 function clearFilters(){setCategory('all');setConditionFilter('all');setAvailability('all');setMinPrice('');setMaxPrice('');}
 function resetFilter(field){
  if(field==='category')setCategory('all');
  if(field==='condition')setConditionFilter('all');
  if(field==='availability')setAvailability('all');
  if(field==='price'){setMinPrice('');setMaxPrice('');}
 }
 useEffect(()=>{
  if(!filtersOpen)return;
  function onKey(e){if(e.key==='Escape')setFiltersOpen(false);}
  function onPointer(e){if(!e.target.closest('.filter-control'))setFiltersOpen(false);}
  document.addEventListener('keydown',onKey);
  document.addEventListener('pointerdown',onPointer);
  return()=>{document.removeEventListener('keydown',onKey);document.removeEventListener('pointerdown',onPointer);};
 },[filtersOpen]);
 function startEdit(item){if(item&&item.owner!=='you')return;setError('');setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});}
 function submit(event){event.preventDefault();const f=editor.form;const err=findError(f);if(err){setError('Unable to save item. Check the form.');return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);}
 function reset(){setItems(seed);setSelected(null);setEditor(null);setCompareIds([]);setComparisonOpen(false);setQuery('');clearFilters();setFiltersOpen(false);setSort('featured');setNotice('Example items restored.');}
 return <div className={compareItems.length ? "market-app has-comparison" : "market-app"}>
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);clearFilters();setQuery('');}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav aria-label="Main navigation"><a href="#discover">Browse items</a></nav><div className="nav-actions"><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button onClick={()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore listings <span>↗</span></button></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover">
    <div className="discover-top">
     <div className="discover-title"><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div>
     <div className="discover-right">
      <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <div className="filter-control">
       <button type="button" className={`filter-trigger ${activeFilterCount?'filter-trigger-active':''}`} onClick={()=>setFiltersOpen(o=>!o)} aria-expanded={filtersOpen} aria-controls="filters-panel"><span aria-hidden="true">☷</span> Filters {activeFilterCount>0&&<span className="filter-count">{activeFilterCount}</span>} <span aria-hidden="true" className="filter-chevron">{filtersOpen?'⌃':'⌄'}</span></button>
       {filtersOpen&&<div className="filter-panel" id="filters-panel" aria-label="Filter listings">
        <div className="filter-panel-head"><div><strong>Filter listings</strong><span>Find the right item faster</span></div><button type="button" className="filter-close" aria-label="Close filters" onClick={()=>setFiltersOpen(false)}>×</button></div>
        <div className="filter-fields">
         <label><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
         <label><span>Condition</span><select value={conditionFilter} onChange={e=>setConditionFilter(e.target.value)}><option value="all">Any condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
         <label className="filter-full"><span>Availability</span><select value={availability} onChange={e=>setAvailability(e.target.value)}><option value="all">All listings</option><option value="active">Available now</option><option value="sold">Sold</option></select></label>
         <div className="filter-price filter-full"><span>Price range (EGP)</span><div className="filter-price-inputs"><label><span>Min</span><input type="number" inputMode="numeric" min="0" step="1" placeholder="0" aria-label="Minimum price in EGP" value={minPrice} onChange={e=>setMinPrice(v=>/^\d*(?:\.\d{0,2})?$/.test(e.target.value)?e.target.value:v)}/></label><span aria-hidden="true">–</span><label><span>Max</span><input type="number" inputMode="numeric" min="0" step="1" placeholder="Any" aria-label="Maximum price in EGP" value={maxPrice} onChange={e=>setMaxPrice(v=>/^\d*(?:\.\d{0,2})?$/.test(e.target.value)?e.target.value:v)}/></label></div></div>
        </div>
        <div className="filter-panel-foot"><button type="button" className="clear-filters" onClick={clearFilters} disabled={!activeFilterCount}>Clear all</button><button type="button" className="sell-cta" onClick={()=>setFiltersOpen(false)}>Show {listing.length} {listing.length===1?'item':'items'}</button></div>
       </div>}
      </div>
      <label className="sort"><span>Sort</span><select aria-label="Sort listings" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
     </div>
    </div>
    <div className="browse-summary"><p aria-live="polite"><strong>{listing.length}</strong> {listing.length===1?'listing':'listings'} found <span className="summary-hint">· Select up to 3 available items to compare</span></p>{activeFilterCount>0&&<button type="button" className="summary-clear" onClick={clearFilters}>Clear filters ×</button>}</div>
    {activeFilterCount>0&&<div className="active-filter-chips" aria-label="Active filters">{category!=='all'&&<button type="button" onClick={()=>resetFilter('category')}>{cap(category)} <span aria-hidden="true">×</span></button>}{conditionFilter!=='all'&&<button type="button" onClick={()=>resetFilter('condition')}>{cap(conditionFilter)} <span aria-hidden="true">×</span></button>}{availability!=='all'&&<button type="button" onClick={()=>resetFilter('availability')}>{availability==='active'?'Available':'Sold'} <span aria-hidden="true">×</span></button>}{(minPrice!==''||maxPrice!=='')&&<button type="button" onClick={()=>resetFilter('price')}>EGP {minPrice||'0'} – {maxPrice||'Any'} <span aria-hidden="true">×</span></button>}</div>}
    {notice&&<p className="notice" role="status">{notice} <button type="button" aria-label="Dismiss notification" onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><article className={`product ${compareIds.includes(item.id)?'compare-selected':''} ${item.status==='sold'?'product-sold':''}`} key={item.id}>
     <button className="photo" type="button" onClick={()=>setSelected(item.id)} aria-label={`View details for ${item.title}`}><span className="stamp">{cap(item.condition)}</span><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" /></button>
     <label className={`compare-check ${item.status==='sold'?'compare-unavailable':''}`} title={item.status==='sold'?'Sold listings cannot be compared':compareIds.length>=3&&!compareIds.includes(item.id)?'Remove one item to compare another':''}><input type="checkbox" checked={compareIds.includes(item.id)} disabled={item.status==='sold'||(compareIds.length>=3&&!compareIds.includes(item.id))} onChange={()=>toggleCompare(item.id)} aria-label={`Select ${item.title} for comparison`} /><span>{item.status==='sold'?'Sold':compareIds.includes(item.id)?'Selected':'Compare'}</span></label>
     <div className="prod-details">
      <div className="prod-topline"><span className="product-category">{cap(item.category)}</span><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status==='sold'?'Sold':'Available'}</span></div>
      <h3>{item.title}</h3>
      <div className="card-price">EGP {item.price.toLocaleString()}</div>
      <div className="card-facts"><div className="card-seller"><span className="card-fact-label">Seller</span><span className="seller-name">{item.seller}</span></div><div className="card-pickup" title={item.pickup||'Arrange with seller'}><span aria-hidden="true">⌖</span><span>{item.pickup||'Arrange pickup with seller'}</span></div></div>
      <button type="button" className="details-button" onClick={()=>setSelected(item.id)}>View details <span aria-hidden="true">↗</span></button>
     </div>
    </article>)}{listing.length===0&&<div className="noresults"><strong>No matching listings</strong><p>Try removing a filter or changing your search.</p><button type="button" onClick={()=>{clearFilters();setQuery('');}}>Clear search &amp; filters</button></div>}</div>
   </section>
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  {compareItems.length>0&&<aside className="compare-tray" aria-label="Selected comparison items"><div className="compare-tray-heading"><strong>Compare items <span className="compare-count">{compareItems.length}/3</span></strong><span>{compareItems.length<2?'Choose at least one more item': 'Ready to compare'}</span></div><div className="compare-chips">{compareItems.map(item=><span className="compare-chip" key={item.id}><span>{item.title}</span><button type="button" onClick={()=>toggleCompare(item.id)} aria-label={`Remove ${item.title} from comparison`}>×</button></span>)}</div><div className="compare-tray-actions"><button type="button" className="compare-clear" onClick={()=>{setCompareIds([]);setComparisonOpen(false);}}>Clear</button><button type="button" className="sell-cta compare-open" disabled={compareItems.length<2} onClick={()=>setComparisonOpen(true)}>Compare {compareItems.length} items ↗</button></div></aside>}
  </main>
  {comparisonOpen&&compareItems.length>=2&&<div className="overlay compare-overlay" onMouseDown={e=>e.target===e.currentTarget&&setComparisonOpen(false)}><section className="compare-modal" role="dialog" aria-modal="true" aria-label="Compare listings"><div className="compare-modal-head"><div><p className="section-kicker">MAKE AN INFORMED CHOICE</p><h2>Compare listings</h2><p>Check price, condition and pickup details before contacting a seller.</p></div><button type="button" className="close" aria-label="Close comparison" onClick={()=>setComparisonOpen(false)}>×</button></div><div className="compare-scroll"><div className="compare-grid" style={{gridTemplateColumns:`repeat(${compareItems.length}, minmax(245px, 1fr))`}}>{compareItems.map(item=><article className="compare-column" key={item.id}><div className="compare-photo"><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="compare-img" /></div><div className="compare-product-head"><h3>{item.title}</h3><button type="button" aria-label={`Remove ${item.title} from comparison`} onClick={()=>toggleCompare(item.id)}>×</button></div><div className="compare-fact compare-price"><span>Asking price</span><strong>EGP {item.price.toLocaleString()}</strong></div><div className="compare-fact"><span>Condition</span><strong>{cap(item.condition)}</strong></div><div className="compare-fact"><span>Category</span><strong>{cap(item.category)}</strong></div><div className="compare-fact"><span>Seller</span><strong>{item.seller}</strong></div><div className="compare-fact"><span>Pickup / meetup</span><strong>{item.pickup||'Arrange with seller'}</strong></div><div className="compare-fact compare-description"><span>Description</span><p>{item.description||'No description supplied.'}</p></div><button type="button" className="details-button compare-view" onClick={()=>{setComparisonOpen(false);setSelected(item.id);}}>View item &amp; contact <span>↗</span></button></article>)}</div></div><p className="compare-footnote">Prices are set by individual sellers. Condition descriptions are seller-provided.</p></section></div>}
  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
     <button type="button" className="close detail-close" aria-label="Close item details" onClick={()=>setSelected(null)}>×</button>
     <div className="detail-visual">
      <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
     </div>
     {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
     <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
     <h2>{item.title}</h2>
     <h3>EGP {item.price.toLocaleString()}</h3>
     <p className="item-description">{item.description||'No description supplied.'}</p>
     <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
     <p className="muted">Status: {item.status}</p>
     {item.owner==='you'
       ? <button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
    </section>
   </div>;
  })()}
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest.</p></div><button type="button" className="close" aria-label="Close listing form" onClick={()=>setEditor(null)}>×</button></div><form onSubmit={submit}><div className="field-grid"><label><span>Item title *</span><input value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/></label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="Price"/></label><label><span>Category *</span><select value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label><span>Condition *</span><select value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="5"/></label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label><label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}</div>{error&&<p className="alert" role="alert">{error}</p>}<div className="modal-foot"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
