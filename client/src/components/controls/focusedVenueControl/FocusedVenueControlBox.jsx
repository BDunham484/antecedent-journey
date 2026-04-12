import { useEffect, useRef, useState } from "react";
import Switch from 'react-switch';
import austinVenues from "../../../data/states/texas/austin";
import { switchTheme } from "../../../definitions/constants";
import { formatScrapeTime } from "../../../utils/helpers";
import VenueList from "../../VenueList";
import sharedStyles from '../ControlBox.module.css';
import ownStyles from './FocusedVenueControlBox.module.css';

const {
    controlContainer,
    controlHeader,
    controlStatus,
    statusWrapper,
    venueShimmer,
} = sharedStyles;

const {
    venueBody,
    dropdownWrapper,
    dropdownTrigger,
    dropdownPlaceholder,
    dropdownArrow,
    pill,
    pillRemove,
    dropdownMenu,
    dropdownItem,
    selected,
    checkbox,
    checked,
} = ownStyles;

const FocusedVenueControlBox = ({
    scrapeMetaData,
    run,
    isScrapeLoading,
    isInsertLoading,
    totalScraped,
    insertCount,
    venueStatuses,
}) => {
    const lastFocusedScrape = scrapeMetaData?.getScrapeMeta?.lastFocusedScrape ?? null;

    const [focusedSwitch, setFocusedSwitch] = useState(false);
    const [selectedVenues, setSelectedVenues] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Auto-reset switch when insert run completes
    useEffect(() => {
        if (totalScraped > 0 && !isInsertLoading) {
            setFocusedSwitch(false);
        }
    }, [isInsertLoading, totalScraped]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const toggleVenue = (venue) => {
        setSelectedVenues(prev =>
            prev.find(v => v.key === venue.key)
                ? prev.filter(v => v.key !== venue.key)
                : [...prev, venue]
        );
    };

    const removeVenue = (e, venue) => {
        e.stopPropagation();
        setSelectedVenues(prev => prev.filter(v => v.key !== venue.key));
    };

    const handleSwitch = () => {
        if (focusedSwitch) {
            setFocusedSwitch(false);
        } else {
            setFocusedSwitch(true);
            run(selectedVenues.map(v => v.key));
        }
    };

    const getVenueLightClass = (venueName) => {
        const status = venueStatuses?.[venueName];
        if (!status) return 'light-idle';
        if (status === 'inserting') return 'light-yellow';
        if (status === 'success') return 'light-green';
        if (status === 'error') return 'light-red';
        return 'light-idle';
    };

    const isDisabled = selectedVenues.length === 0 || isScrapeLoading || isInsertLoading;

    return (
        <div className={`${controlContainer}${isScrapeLoading ? ` ${venueShimmer}` : ''}`}>
            <div className={controlHeader}>
                <div>
                    <h2>AUSTIN: FOCUSED</h2>
                    <div>{lastFocusedScrape ? `Last ran: ${formatScrapeTime(lastFocusedScrape)}` : 'Last ran: --'}</div>
                </div>
                <Switch
                    {...switchTheme}
                    onChange={handleSwitch}
                    checked={focusedSwitch}
                    disabled={isDisabled}
                />
            </div>

            {/* Dropdown */}
            <div className={dropdownWrapper} ref={dropdownRef}>
                <div className={dropdownTrigger} onClick={() => setIsOpen(prev => !prev)}>
                    {selectedVenues.length === 0 ? (
                        <span className={dropdownPlaceholder}>Select venues...</span>
                    ) : (
                        selectedVenues.map(venue => (
                            <span key={venue.key} className={pill}>
                                {venue.name}
                                <button className={pillRemove} onClick={(e) => removeVenue(e, venue)}>×</button>
                            </span>
                        ))
                    )}
                    <span className={dropdownArrow}>▾</span>
                </div>
                {isOpen && (
                    <div className={dropdownMenu}>
                        {austinVenues.map(venue => {
                            const isSelected = !!selectedVenues.find(v => v.key === venue.key);
                            return (
                                <div
                                    key={venue.key}
                                    className={`${dropdownItem}${isSelected ? ` ${selected}` : ''}`}
                                    onClick={() => toggleVenue(venue)}
                                >
                                    <div className={`${checkbox}${isSelected ? ` ${checked}` : ''}`}>
                                        {isSelected ? '✓' : ''}
                                    </div>
                                    {venue.name}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Status row */}
            <section className={controlStatus}>
                <div>
                    <div className={statusWrapper}>
                        <h3>SCRAPE: {totalScraped > 0 ? totalScraped : '--'}</h3>
                    </div>
                </div>
                <div>
                    <div className={statusWrapper}>
                        <h3>INSERT: {insertCount > 0 ? insertCount : '--'}</h3>
                    </div>
                </div>
            </section>

            {/* Venue list */}
            {selectedVenues.length > 0 && (
                <div className={venueBody}>
                    <VenueList venues={selectedVenues} getStatusClass={getVenueLightClass} />
                </div>
            )}
        </div>
    );
};

export default FocusedVenueControlBox;
