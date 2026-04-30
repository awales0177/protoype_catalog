import PropTypes from 'prop-types';
import { SearchIcon } from '../icons';

export function CatalogHeroSearchRegion({ children }) {
  return <div className="catalogHeroSearchRegion">{children}</div>;
}

CatalogHeroSearchRegion.propTypes = {
  children: PropTypes.node,
};

export function CatalogHeroSearch({
  variant = 'editable',
  value,
  onChange,
  onSubmit,
  placeholder = 'Search',
}) {
  if (variant === 'editable') {
    return (
      <form
        className="catalogHeroSearchForm"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
      >
        <span className="catalogHeroSearchLead" aria-hidden>
          <SearchIcon />
        </span>
        <input
          type="search"
          className="catalogHeroSearchInput"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
        />
      </form>
    );
  }

  return (
    <button type="button" className="catalogHeroSearchForm">
      <span className="catalogHeroSearchLead" aria-hidden>
        <SearchIcon />
      </span>
      <span className="catalogHeroSearchPlaceholder">{placeholder}</span>
    </button>
  );
}

CatalogHeroSearch.propTypes = {
  variant: PropTypes.oneOf(['editable', 'button']),
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  placeholder: PropTypes.string,
};
