import { useEffect } from 'react';

export function useLeafletPatches(leafletLoaded: boolean) {
  useEffect(() => {
    if (leafletLoaded) {
      const L = (window as any).L;
      if (L && !L._patchedSafelyInComp) {
        L._patchedSafelyInComp = true;
        
        if (L.DomUtil) {
          L.DomUtil.setPosition = function (el: any, point: any) {
            if (!el) return;
            try {
              el._leaflet_pos = point;
              if (L.Browser && L.Browser.any3d) {
                L.DomUtil.setTransform(el, point);
              } else if (el.style) {
                el.style.left = (point ? point.x : 0) + 'px';
                el.style.top = (point ? point.y : 0) + 'px';
              }
            } catch (err) {
              // Intercept
            }
          };

          L.DomUtil.getPosition = function (el: any) {
            if (!el) return (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 });
            try {
              return el._leaflet_pos || (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 });
            } catch (err) {
              return (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 });
            }
          };
        }

        if (L.PosAnimation && L.PosAnimation.prototype) {
          L.PosAnimation.prototype._runFrame = function (progress: any, round: any) {
            if (!this._el) return;
            try {
              let pos = this._startPos.add(this._offset.multiplyBy(progress));
              if (round) pos = pos.round();
              if (this._el) {
                this._el._leaflet_pos = pos;
                L.DomUtil.setPosition(this._el, pos);
              }
              this.fire('step');
            } catch (err) {
              // Intercept
            }
          };
        }

        if (L.Marker && L.Marker.prototype) {
          const _origMarkerSetPos = L.Marker.prototype._setPos;
          if (_origMarkerSetPos) {
            L.Marker.prototype._setPos = function (pos: any) {
              if (!this._icon && !this._shadow) return;
              try {
                if (this._icon) this._icon._leaflet_pos = pos;
                if (this._shadow) this._shadow._leaflet_pos = pos;
                return _origMarkerSetPos.call(this, pos);
              } catch (err) {
                // Intercept
              }
            };
          }
        }
      }
    }
  }, [leafletLoaded]);
}
