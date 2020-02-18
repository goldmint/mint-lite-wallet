package h

import (
	"errors"
	"fmt"
	"syscall/js"
)

// throw JS error
func throw(v interface{}) interface{} {
	s := ""
	switch x := v.(type) {
	case string:
		s = x
	case error:
		s = x.Error()
	default:
		s = "incorrect mint library usage"
	}
	fmt.Println(s)
	return nil
}

// Recover stops panic
func Recover() {
	if v := recover(); v != nil {
		throw(v)
	}
}

// MakeUint8Array allocates Uint8Array
func MakeUint8Array(len int) js.Value {
	return js.Global().Call("eval", fmt.Sprintf("new Uint8Array(%v)", len))
}

// GetBytes copies Uint8Array to a new bytes buffer
func GetBytes(v js.Value) ([]byte, error) {
	len := v.Length()
	if len == 0 {
		return nil, errors.New("empty buffer")
	}
	buf := make([]byte, len)
	if n := js.CopyBytesToGo(buf, v); n != len {
		return nil, errors.New("failed to copy bytes")
	}
	return buf, nil
}

// GetUint8Array copies bytes to a new Uint8Array
func GetUint8Array(b []byte) (js.Value, error) {
	if len(b) == 0 {
		return js.Null(), errors.New("empty buffer")
	}
	arr := MakeUint8Array(len(b))
	if n := js.CopyBytesToJS(arr, b); n != len(b) {
		return js.Null(), errors.New("failed to copy bytes")
	}
	return arr, nil
}
