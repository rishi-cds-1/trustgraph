package enrichment

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// doWithRetry issues an HTTP request built fresh by newReq, retrying up to
// attempts times on network errors, 429, and 5xx responses. newReq is called
// again on every attempt so it must produce a request with a re-readable body.
func doWithRetry(ctx context.Context, client *http.Client, attempts int, newReq func() (*http.Request, error)) (*http.Response, error) {
	var lastErr error
	for i := 0; i < attempts; i++ {
		if i > 0 {
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(time.Duration(i) * 500 * time.Millisecond):
			}
		}

		req, err := newReq()
		if err != nil {
			return nil, err
		}

		res, err := client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}
		if res.StatusCode >= 500 || res.StatusCode == http.StatusTooManyRequests {
			res.Body.Close()
			lastErr = fmt.Errorf("http %s", res.Status)
			continue
		}
		return res, nil
	}
	return nil, lastErr
}
