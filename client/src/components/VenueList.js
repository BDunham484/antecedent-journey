const VenueList = ({ venues, getStatusClass }) => {
    const sorted = [...venues].sort((a, b) => a.localeCompare(b));
    const mid = Math.ceil(sorted.length / 2);
    const colA = sorted.slice(0, mid);
    const colB = sorted.slice(mid);

    const renderItem = (v) => (
        <div key={v.replace(/\s+/g, '')} className='venue-list-item'>
            <div className={`indicator-light ${getStatusClass(v)}`} />
            <span>{v}</span>
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
