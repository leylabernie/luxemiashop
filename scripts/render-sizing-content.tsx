import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import SizingMeasurementsContent from '../src/components/SizingMeasurementsContent';
import { measurementTitle } from '../src/data/sizingMeasurements';
import SizingNextSteps from '../src/components/SizingNextSteps';

export { measurementTitle };
export const measurementHtml = renderToStaticMarkup(<StaticRouter location="/sizing-measurements-guide"><SizingMeasurementsContent isStaticFallback /></StaticRouter>);
export const sizingNextStepsHtml = renderToStaticMarkup(<StaticRouter location="/blog/indian-to-us-clothing-size-conversion-guide"><SizingNextSteps /></StaticRouter>);
