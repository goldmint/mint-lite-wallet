package mint

import "time"

var epochStart time.Time

func init() {
	loc, err := time.LoadLocation("UTC")
	if err != nil {
		panic(err)
	}
	epochStart = time.Date(1400, 01, 01, 00, 00, 00, 000000, loc)
}

// StampToTime converts mint timestamp to time.Time
func StampToTime(timestamp uint64) time.Time {
	const spd uint64 = 86400
	const mcsm uint64 = 1000000

	s := timestamp / mcsm
	days := int(s / spd)
	secs := time.Duration(s % spd)
	mcs := time.Duration(timestamp % mcsm)

	return epochStart.
		AddDate(0, 0, days).
		Add(time.Second * secs).
		Add(time.Microsecond * mcs)
}
