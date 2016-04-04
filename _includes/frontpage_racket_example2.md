```racket
(actor
 (forever
   (on (asserted (account $balance))
       (printf "Balance: ~a\n"
               balance))))
```
