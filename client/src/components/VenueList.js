const VenueList = ({ venues, getStatusClass }) => {
    const sorted = [...venues].sort((a, b) => a.name.localeCompare(b.name));
    const mid = Math.ceil(sorted.length / 2);
    const colA = sorted.slice(0, mid);
    const colB = sorted.slice(mid);

    const renderItem = (venue) => (
        <div key={venue.name.replace(/\s+/g, '')} className='venue-list-item'>
            <div className={`indicator-light ${getStatusClass(venue.name)}`} />
            <span>{venue.name}</span>
        </div>
    );

    return (
        <>
            <div className='venue-list-col'>{colA.map(renderItem)}</div>
            <div className='venue-list-col'>{colB.map(renderItem)}</div>
        </>
    );
};

export default VenueList;
