import { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FlowModelerGlyph, ChevronDownIcon, SearchIcon } from '../icons';
import { CATALOG_QUICK_ACTION_SPECS } from '../data/catalogQuickActions';
import { AnchoredPortalPanel } from './AnchoredPortalPanel';

function FlowGlyphImg() {
  return (
    <span className="catalogHeroActionsTriggerIcon catalogHeroActionsTriggerIcon--svg" aria-hidden>
      <FlowModelerGlyph size={18} style={{ display: 'block', color: '#fff' }} />
    </span>
  );
}

/** Actions launcher — `variant` reserved for layout tweaks (e.g. global bar vs hero). */
export function CatalogHeroActionsMenu({ variant: _variant = 'toolbar' }) {
  void _variant;

  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return CATALOG_QUICK_ACTION_SPECS;
    return CATALOG_QUICK_ACTION_SPECS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [filter]);

  const triggerClass =
    variant === 'globalBar'
      ? 'catalogHeroHeaderBtn catalogHeroShowSm'
      : 'catalogHeroHeaderBtn';

  return (
    <div className="catalogHeroActionsWrap">
      <button
        ref={btnRef}
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="catalogHeroHeaderBtnStart">
          <FlowGlyphImg />
        </span>
        Actions
        <ChevronDownIcon />
      </button>

      <AnchoredPortalPanel
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        className="catalogHeroActionsPanel"
      >
        <div className="catalogHeroActionsPanel__header">
          <div className="catalogHeroActionsPanel__headerPill">
            <FlowGlyphImg />
            Actions
          </div>
          <label className="catalogHeroActionsPanel__searchLabel">
            <SearchIcon />
            <input
              type="search"
              className="catalogHeroActionsPanel__search"
              placeholder="Search actions"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Search actions"
            />
          </label>
        </div>
        <div className="catalogHeroActionsPanel__list" role="list">
          {filtered.length === 0 ? (
            <p className="catalogHeroActionsPanel__empty">No actions match your search.</p>
          ) : (
            filtered.map((spec) => (
              <button key={spec.id} type="button" className="catalogHeroActionsCard" role="listitem">
                <span className="catalogHeroActionsCard__iconBox">
                  {spec.iconKind === 'flow' ? (
                    <FlowModelerGlyph size={22} className="catalogHeroActionsCard__flowSvg" />
                  ) : (
                    <spec.Icon />
                  )}
                </span>
                <span className="catalogHeroActionsCard__body">
                  <span className="catalogHeroActionsCard__title">{spec.label}</span>
                  <span className="catalogHeroActionsCard__desc">{spec.description}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </AnchoredPortalPanel>
    </div>
  );
}

CatalogHeroActionsMenu.propTypes = {
  variant: PropTypes.oneOf(['toolbar', 'globalBar']),
};

CatalogHeroActionsMenu.defaultProps = {
  variant: 'toolbar',
};
