import { useRef, useState, useEffect } from 'react';
import mermaid from 'mermaid';
import PropTypes from 'prop-types';

mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });

function MermaidDiagram({ code }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const bindFunctionsRef = useRef(null);

  useEffect(() => {
    if (!code?.trim()) return;
    setSvg(null);
    setErrorMessage(null);
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    let cancelled = false;

    mermaid
      .render(id, code.trim())
      .then(({ svg: renderedSvg, bindFunctions }) => {
        if (cancelled) return;
        bindFunctionsRef.current = bindFunctions;
        setSvg(renderedSvg);
      })
      .catch((err) => {
        if (!cancelled) setErrorMessage(String(err.message ?? err));
      });

    return () => { cancelled = true; };
  }, [code]);

  useEffect(() => {
    if (svg && containerRef.current && bindFunctionsRef.current) {
      bindFunctionsRef.current(containerRef.current);
      bindFunctionsRef.current = null;
    }
  }, [svg]);

  if (errorMessage) return <div className="readmeMermaidError">Diagram failed to render: {errorMessage}</div>;
  if (!svg) return <div className="readmeMermaidDiagram readmeMermaidLoading">Rendering diagram…</div>;
  return (
    <div ref={containerRef} className="readmeMermaidDiagram" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

MermaidDiagram.propTypes = {
  code: PropTypes.string,
};

export default MermaidDiagram;
