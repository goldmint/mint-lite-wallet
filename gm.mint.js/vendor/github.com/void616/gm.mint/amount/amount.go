package amount

import (
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
)

// Precision of amount
const Precision = 18

func init() {
	if Precision < 6 {
		panic("precision < 6")
	}
}

// Amount is amount of token in Sumus
type Amount struct {
	Value *big.Int
}

// New amount instance
func New() *Amount {
	return &Amount{
		Value: big.NewInt(0),
	}
}

// FromAmount creates an instance and copies a value from another instance
func FromAmount(a *Amount) *Amount {
	return &Amount{
		Value: big.NewInt(0).Set(a.Value),
	}
}

// FromInteger creates an instance, setting integral part of it's value from integer (100 => 100.000000000000000000)
func FromInteger(i int64) *Amount {
	v := big.NewInt(0).
		Mul(
			big.NewInt(i),
			big.NewInt(0).Exp(big.NewInt(10), big.NewInt(Precision), nil),
		)
	return &Amount{
		Value: v,
	}
}

// FromBig creates an instance, setting it's value from big integer (100 => 0.000000000000000100)
func FromBig(b *big.Int) *Amount {
	return &Amount{
		Value: big.NewInt(0).Set(b),
	}
}

// FromString creates an instance from a string containing float-point representation of the value.
// Example: "1.000000000000000000123" => 1.000000000000000000
// Example: "1.000000000000000000999" => 1.000000000000000001
func FromString(s string) (*Amount, error) {
	f, ok := big.NewRat(1, 1).SetString(s)
	if !ok {
		return nil, fmt.Errorf("failed to parse amount")
	}
	t := strings.Replace(f.FloatString(Precision), ".", "", -1)
	return FromBigString(t, 10)
}

// MustFromString does the same as FromString, but panics on error
func MustFromString(s string) *Amount {
	a, err := FromString(s)
	if err != nil {
		panic(err)
	}
	return a
}

// FromBigString creates an instance from a string containing big integer representation of the value.
// Example: "0100" (base 10) => 0.000000000000000100, "100" (base 00) => 0.000000000000000100
// Example: "000A" (base 16) => 0.000000000000000010, "0xA" (base 00) => 0.000000000000000010
// Example: "0144" (base 08) => 0.000000000000000100, "012" (base 00) => 0.000000000000000010
func FromBigString(s string, base int) (*Amount, error) {
	v, ok := big.NewInt(0).SetString(s, base)
	if !ok {
		return nil, fmt.Errorf("failed to parse amount")
	}
	return &Amount{
		Value: v,
	}, nil
}

// MustFromBigString does the same as FromBigString, but panics on error
func MustFromBigString(s string, base int) *Amount {
	a, err := FromBigString(s, base)
	if err != nil {
		panic(err)
	}
	return a
}

// ---

// String representation: -100.000000000000000123
func (a *Amount) String() string {
	sign := ""
	if a.Value.Cmp(big.NewInt(0)) < 0 {
		sign = "-"
	}
	abs := big.NewInt(0).Abs(a.Value)
	ret := fmt.Sprintf(fmt.Sprintf("%%0%ds", Precision+1), abs.Text(10))
	return fmt.Sprintf("%s%s.%s", sign, ret[:len(ret)-Precision], ret[len(ret)-Precision:])
}

// Float64 approximation (6 decimal places)
func (a *Amount) Float64() float64 {
	x := new(big.Int).Abs(a.Value)
	x = new(big.Int).Div(x, new(big.Int).Exp(big.NewInt(10), big.NewInt(Precision-6), nil))
	if x.IsInt64() {
		ret := float64(x.Int64()) / 1000000.0
		if a.IsNeg() {
			return -ret
		}
		return ret
	}
	return 0
}

// IsNeg value
func (a *Amount) IsNeg() bool {
	return a.Value.Cmp(big.NewInt(0)) < 0
}

// Integer part as string:
// -123.000000000000456000 => "123" (width 0)
// -123.000000000000456000 => "00123" (width 5)
func (a *Amount) Integer(width uint) string {
	ret := big.NewInt(0).Abs(a.Value)
	ret.Div(ret, big.NewInt(0).Exp(big.NewInt(10), big.NewInt(Precision), nil))
	return fmt.Sprintf(fmt.Sprintf("%%0%ds", width), ret.Text(10))
}

// Fraction part as string:
// -123.000000000000456000 => "456000" (width 0)
// -123.000000000000456000 => "000000000000456000" (width 18)
func (a *Amount) Fraction(width uint) string {
	ret := big.NewInt(0).Abs(a.Value)
	ret.Mod(ret, big.NewInt(0).Exp(big.NewInt(10), big.NewInt(Precision), nil))
	return fmt.Sprintf(fmt.Sprintf("%%0%ds", width), ret.Text(10))
}

// ---

// MarshalJSON impl.
func (a *Amount) MarshalJSON() ([]byte, error) {
	return json.Marshal(a.String())
}

// UnmarshalJSON impl.
func (a *Amount) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	tmp, err := FromString(s)
	if err != nil {
		return fmt.Errorf("failed to parse amount from `%v`: %v", s, err)
	}
	*a = *tmp
	return nil
}
