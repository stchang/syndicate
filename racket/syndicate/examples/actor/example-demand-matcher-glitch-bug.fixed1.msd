(#f #f name-summary ((() . "'ground")))
(#f #s(spacetime (meta) 0) actions-produced 1)
(#f #s(spacetime (0) 1) spawn "drivers/tcp:dm:listener")
(#s(spacetime (0) 1) #s(spacetime (0) 2) actions-produced 1)
(#f #s(spacetime (1) 3) spawn "drivers/tcp:dm:connect")
(#s(spacetime (1) 3) #s(spacetime (1) 4) actions-produced 1)
(#f #s(spacetime (2) 5) spawn "connection-acceptor")
(#s(spacetime (2) 5) #s(spacetime (2) 6) actions-produced 1)
(#f #s(spacetime (3) 7) spawn "configuration-provider")
(#s(spacetime (3) 7) #s(spacetime (3) 8) actions-produced 1)
(#s(spacetime (meta) 0) #s(spacetime () 9) action-interpreted patch "- ::: nothing\n+ <s:observe/1 <s:outbound/1 ★ {#t}\n+ <s:observe/1 <s:observe/1 <s:inbound/1 ★ {#t}\n")
(#s(spacetime (1) 10) #s(spacetime (1) 11) turn-begin)
(#s(spacetime (1) 11) #s(spacetime (1) 12) turn-end)
(#s(spacetime (3) 13) #s(spacetime (3) 14) turn-begin)
(#s(spacetime (3) 14) #s(spacetime (3) 15) turn-end)
(#s(spacetime (2) 16) #s(spacetime (2) 17) turn-begin)
(#s(spacetime (2) 17) #s(spacetime (2) 18) turn-end)
(#s(spacetime (0) 19) #s(spacetime (0) 20) turn-begin)
(#s(spacetime (0) 20) #s(spacetime (0) 21) turn-end)
(#f #s(spacetime () 22) turn-end)
(#s(spacetime () 24) #s(spacetime () 25) turn-begin)
(#s(spacetime (0) 2) #s(spacetime () 26) action-interpreted patch "- ::: nothing\n+ <s:observe/1 <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 ★ ★ {#t}\n+ <s:observe/1 <s:advertise/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 ★ ★ {#t}\n+ <s:advertise/1 <s:advertise/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 ★ ★ {#t}\n")
(#s(spacetime (1) 4) #s(spacetime () 27) action-interpreted patch "- ::: nothing\n+ <s:observe/1 <s:observe/1 <s:tcp-channel/3 <s:tcp-handle/1 ★ <s:tcp-address/2 ★ ★ ★ {#t}\n+ <s:observe/1 <s:advertise/1 <s:tcp-channel/3 <s:tcp-handle/1 ★ <s:tcp-address/2 ★ ★ ★ {#t}\n+ <s:advertise/1 <s:observe/1 <s:tcp-channel/3 <s:tcp-handle/1 ★ <s:tcp-address/2 ★ ★ ★ {#t}\n")
(#s(spacetime (2) 6) #s(spacetime () 28) action-interpreted patch "- ::: nothing\n+ <s:observe/1 <s:listen-port/1 ★ {#t}\n+ <s:observe/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {#t}\n+ <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {#t}\n")
(#s(spacetime () 28) #s(spacetime (0) 29) event patch "- ::: nothing\n+ <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {2}\n" #s(spacetime (2) 6) ((2)))
(#s(spacetime (0) 29) #s(spacetime (0) 30) turn-begin)
(#s(spacetime (0) 30) #s(spacetime (0) 31) turn-end)
(#s(spacetime (0) 31) #s(spacetime (0) 32) actions-produced 1)
(#s(spacetime (3) 8) #s(spacetime () 33) action-interpreted patch "- ::: nothing\n+ <s:listen-port/1 5999 {#t}\n")
(#s(spacetime () 33) #s(spacetime (2) 34) event patch "- ::: nothing\n+ <s:listen-port/1 5999 {3}\n" #s(spacetime (3) 8) ((3)))
(#s(spacetime (2) 34) #s(spacetime (2) 35) turn-begin)
(#s(spacetime (2) 35) #s(spacetime (2) 36) turn-end)
(#s(spacetime (2) 36) #s(spacetime (2) 37) actions-produced 1)
(#s(spacetime (2) 38) #s(spacetime (2) 39) turn-begin)
(#s(spacetime (2) 39) #s(spacetime (2) 40) turn-end)
(#s(spacetime (0) 41) #s(spacetime (0) 42) turn-begin)
(#s(spacetime (0) 42) #s(spacetime (0) 43) turn-end)
(#s(spacetime () 25) #s(spacetime () 44) turn-end)
(#s(spacetime () 46) #s(spacetime () 47) turn-begin)
(#s(spacetime (0) 32) #s(spacetime (4) 48) spawn "(drivers/tcp:listen 6000)")
(#s(spacetime (4) 48) #s(spacetime (4) 49) actions-produced 1)
(#s(spacetime (4) 48) #s(spacetime (4) 50) actions-produced 1)
(#s(spacetime (4) 49) #s(spacetime () 51) action-interpreted patch "- ::: nothing\n+ <s:observe/1 <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {#t}\n")
(#s(spacetime () 51) #s(spacetime (4) 52) event patch "- ::: nothing\n+ <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {2}\n" #s(spacetime (4) 49) ((2)))
(#s(spacetime (4) 52) #s(spacetime (4) 53) turn-begin)
(#s(spacetime (4) 53) #s(spacetime (4) 54) turn-end)
(#s(spacetime (2) 37) #s(spacetime () 55) action-interpreted patch "- <s:observe/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {#t}\n- <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {#t}\n+ <s:observe/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 5999 ★ {#t}\n+ <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 5999 ★ {#t}\n")
(#s(spacetime () 55) #s(spacetime (0) 56) event patch "- <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {2}\n+ <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 5999 ★ {2}\n" #s(spacetime (2) 37) ((2)))
(#s(spacetime (0) 56) #s(spacetime (0) 57) turn-begin)
(#s(spacetime (0) 57) #s(spacetime (0) 58) turn-end)
(#s(spacetime (0) 58) #s(spacetime (0) 59) actions-produced 1)
(#s(spacetime () 55) #s(spacetime (4) 60) event patch "- <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {2}\n+ ::: nothing\n" #s(spacetime (2) 37) ((2)))
(#s(spacetime (4) 60) #s(spacetime (4) 61) turn-begin)
(#s(spacetime (4) 61) #s(spacetime (4) 62) turn-end)
(#s(spacetime (4) 62) #s(spacetime (4) 63) exit "#f")
(#s(spacetime (4) 62) #s(spacetime (4) 64) actions-produced 1)
(#s(spacetime (0) 65) #s(spacetime (0) 66) turn-begin)
(#s(spacetime (0) 66) #s(spacetime (0) 67) turn-end)
(#s(spacetime () 47) #s(spacetime () 68) turn-end)
(#s(spacetime () 70) #s(spacetime () 71) turn-begin)
(#s(spacetime (4) 50) #s(spacetime () 72) action-interpreted patch "- ::: nothing\n+ <s:observe/1 <s:inbound/1 <s:tcp-accepted/4 ★ <s:tcp-listener/1 6000 ★ ★ {#t}\n+ <s:advertise/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {#t}\n")
(#s(spacetime () 72) #s(spacetime (0) 73) event patch "- ::: nothing\n+ <s:advertise/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {4}\n" #s(spacetime (4) 50) ((4)))
(#s(spacetime (0) 73) #s(spacetime (0) 74) turn-begin)
(#s(spacetime (0) 74) #s(spacetime (0) 75) turn-end)
(#s(spacetime (0) 59) #s(spacetime (5) 77) spawn "(drivers/tcp:listen 5999)")
(#s(spacetime (5) 77) #s(spacetime (5) 78) actions-produced 1)
(#s(spacetime (5) 77) #s(spacetime (5) 79) actions-produced 1)
(#s(spacetime (5) 78) #s(spacetime () 80) action-interpreted patch "- ::: nothing\n+ <s:observe/1 <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 5999 ★ {#t}\n")
(#s(spacetime () 80) #s(spacetime (5) 81) event patch "- ::: nothing\n+ <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 5999 ★ {2}\n" #s(spacetime (5) 78) ((2)))
(#s(spacetime (5) 81) #s(spacetime (5) 82) turn-begin)
(#s(spacetime (5) 82) #s(spacetime (5) 83) turn-end)
(#s(spacetime (4) 64) #s(spacetime () 84) action-interpreted patch "- <s:observe/1 <s:inbound/1 <s:tcp-accepted/4 ★ <s:tcp-listener/1 6000 ★ ★ {#t}\n- <s:observe/1 <s:advertise/1 <s:observe/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {#t}\n- <s:advertise/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {#t}\n+ ::: nothing\n")
(#s(spacetime () 84) #s(spacetime (0) 85) event patch "- <s:advertise/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 6000 ★ {4}\n+ ::: nothing\n" #s(spacetime (4) 64) ((4)))
(#s(spacetime (0) 85) #s(spacetime (0) 86) turn-begin)
(#s(spacetime (0) 86) #s(spacetime (0) 87) turn-end)
(#s(spacetime (4) 64) #s(spacetime () 89) quit)
(#s(spacetime (5) 90) #s(spacetime (5) 91) turn-begin)
(#s(spacetime (5) 91) #s(spacetime (5) 92) turn-end)
(#s(spacetime (0) 93) #s(spacetime (0) 94) turn-begin)
(#s(spacetime (0) 94) #s(spacetime (0) 95) turn-end)
(#s(spacetime () 71) #s(spacetime () 96) turn-end)
(#s(spacetime () 98) #s(spacetime () 99) turn-begin)
(#s(spacetime (5) 79) #s(spacetime () 100) action-interpreted patch "- ::: nothing\n+ <s:observe/1 <s:inbound/1 <s:tcp-accepted/4 ★ <s:tcp-listener/1 5999 ★ ★ {#t}\n+ <s:advertise/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 5999 ★ {#t}\n")
(#s(spacetime () 100) #s(spacetime (0) 101) event patch "- ::: nothing\n+ <s:advertise/1 <s:advertise/1 <s:tcp-channel/3 ★ <s:tcp-listener/1 5999 ★ {5}\n" #s(spacetime (5) 79) ((5)))
(#s(spacetime (0) 101) #s(spacetime (0) 102) turn-begin)
(#s(spacetime (0) 102) #s(spacetime (0) 103) turn-end)
(#s(spacetime (0) 105) #s(spacetime (0) 106) turn-begin)
(#s(spacetime (0) 106) #s(spacetime (0) 107) turn-end)
(#s(spacetime () 99) #s(spacetime () 108) turn-end)
(#s(spacetime () 110) #s(spacetime () 111) turn-begin)
(#s(spacetime () 111) #s(spacetime () 112) turn-end)
