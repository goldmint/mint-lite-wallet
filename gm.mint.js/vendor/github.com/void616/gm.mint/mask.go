package mint

import "fmt"

// MaskString6P4 masks a string exposing first 6 and 4 last symbols, like: YeAHCqTJk4aFnHXGV4zaaf3dTqJkdjQzg8TJENmP3zxDMpa97 => YeAHCq***pa97
func MaskString6P4(s string) string {
	charz := []rune(s)
	if len(charz) <= 10 {
		return s
	}
	return fmt.Sprintf("%s***%s", string(charz[0:6]), string(charz[len(charz)-4:]))
}
