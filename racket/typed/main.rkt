#lang turnstile

(provide (rename-out [syndicate:#%module-begin #%module-begin])
         (rename-out [typed-app #%app])
         (rename-out [syndicate:begin-for-declarations declare-types])
         #%top-interaction
         require only-in
         ;; Types
         Int Bool String Tuple Bind Discard Case → Behavior FacetName Field ★
         Observe Inbound Outbound Actor U
         ;; Statements
         let spawn dataspace facet set! begin stop unsafe-do
         ;; endpoints
         assert on
         ;; expressions
         tuple λ ref observe inbound outbound
         ;; values
         #%datum
         ;; patterns
         bind discard
         ;; primitives
         + - * / and or not > < >= <= = equal? displayln
         ;; making types
         define-type-alias
         define-constructor
         ;; DEBUG and utilities
         print-type
         (rename-out [printf- printf])
         ;; Extensions
         match if cond
         )

(require (rename-in racket/match [match-lambda match-lambda-]))
(require (rename-in racket/math [exact-truncate exact-truncate-]))
(require (prefix-in syndicate: syndicate/actor-lang))

(module+ test
  (require rackunit)
  (require rackunit/turnstile))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Types

(define-base-types Int Bool String Discard ★ FacetName)
(define-type-constructor Field #:arity = 1)
;; (Behavior τv τi τo τa)
;; τv is the type of thing it evaluates to
;; τi is the type of patterns used to consume incoming assertions
;; τo is the type of assertions made
;; τa is the type of spawned actors
(define-type-constructor Behavior #:arity = 4)
(define-type-constructor Bind #:arity = 1)
(define-type-constructor Tuple #:arity >= 0)
(define-type-constructor U #:arity >= 0)
(define-type-constructor Case #:arity >= 0)
(define-type-constructor → #:arity > 0)
(define-type-constructor Observe #:arity = 1)
(define-type-constructor Inbound #:arity = 1)
(define-type-constructor Outbound #:arity = 1)
(define-type-constructor Actor #:arity = 1)

(define-for-syntax (type-eval t)
  ((current-type-eval) t))

;; this needs to be here until I stop 'compiling' patterns and just have them expand to the right
;; thing
(begin-for-syntax
  (current-use-stop-list? #f))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; User Defined Types, aka Constructors

;; τ.norm in 1st case causes "not valid type" error when file is compiled
;; (copied from ext-stlc example)
(define-syntax define-type-alias
  (syntax-parser
    [(_ alias:id τ:any-type)
     #'(define-syntax- alias
         (make-variable-like-transformer #'τ.norm))]
    [(_ (f:id x:id ...) ty)
     #'(define-syntax- (f stx)
         (syntax-parse stx
           [(_ x ...)
            #:with τ:any-type #'ty
            #'τ.norm]))]))

(begin-for-syntax
  (define-splicing-syntax-class type-constructor-decl
    (pattern (~seq #:type-constructor TypeCons:id))
    (pattern (~seq) #:attr TypeCons #f))

  (struct user-ctor (typed-ctor untyped-ctor)
    #:property prop:procedure
    (lambda (v stx)
      (define transformer (user-ctor-typed-ctor v))
      (syntax-parse stx
        [(_ e ...)
         #`(#,transformer e ...)]))))

(define-syntax (define-constructor stx)
  (syntax-parse stx
    [(_ (Cons:id slot:id ...)
        ty-cons:type-constructor-decl
        (~seq #:with
              Alias AliasBody) ...)
     #:with TypeCons (or (attribute ty-cons.TypeCons) (format-id stx "~a/t" (syntax-e #'Cons)))
     #:with MakeTypeCons (format-id #'TypeCons "make-~a" #'TypeCons)
     #:with GetTypeParams (format-id #'TypeCons "get-~a-type-params" #'TypeCons)
     #:with TypeConsExpander (format-id #'TypeCons "~~~a" #'TypeCons)
     #:with TypeConsExtraInfo (format-id #'TypeCons "~a-extra-info" #'TypeCons)
     #:with (StructName Cons- type-tag) (generate-temporaries #'(Cons Cons Cons))
     (define arity (stx-length #'(slot ...)))
     #`(begin-
         (struct- StructName (slot ...) #:reflection-name 'Cons #:transparent)
         (define-syntax (TypeConsExtraInfo stx)
           (syntax-parse stx
             [(_ X (... ...)) #'('type-tag 'MakeTypeCons 'GetTypeParams)]))
         (define-type-constructor TypeCons
           #:arity = #,arity
           #:extra-info 'TypeConsExtraInfo)
         (define-syntax (MakeTypeCons stx)
           (syntax-parse stx
             [(_ t (... ...))
              #:fail-unless (= #,arity (stx-length #'(t (... ...)))) "arity mismatch"
              #'(TypeCons t (... ...))]))
         (define-syntax (GetTypeParams stx)
           (syntax-parse stx
             [(_ (TypeConsExpander t (... ...)))
              #'(t (... ...))]))
         (define-syntax Cons
           (user-ctor #'Cons- #'StructName))
         (define-typed-syntax (Cons- e (... ...)) ≫
           #:fail-unless (= #,arity (stx-length #'(e (... ...)))) "arity mismatch"
           [⊢ e ≫ e- (⇒ : τ)] (... ...)
           ----------------------
           [⊢ (#%app- StructName e- (... ...)) (⇒ : (TypeCons τ (... ...)))
              (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])
         (define-type-alias Alias AliasBody) ...)]))

(begin-for-syntax
  (define-syntax ~constructor-extra-info
    (pattern-expander
     (syntax-parser
       [(_ tag mk get)
        #'(_ (_ tag) (_ mk) (_ get))])))

  (define-syntax ~constructor-type
    (pattern-expander
     (syntax-parser
       [(_ tag . rst)
        #'(~and it
                (~fail #:unless (user-defined-type? #'it))
                (~parse tag (get-type-tag #'it))
                (~Any _ . rst))])))

  (define-syntax ~constructor-exp
    (pattern-expander
     (syntax-parser
       [(_ cons . rst)
        #'(~and (cons . rst)
                (~fail #:unless (ctor-id? #'cons)))])))

  (define (inspect t)
    (syntax-parse t
      [(~constructor-type tag t ...)
       (list (syntax-e #'tag) (stx-map type->str #'(t ...)))]))

  (define (tags-equal? t1 t2)
    (equal? (syntax-e t1) (syntax-e t2)))
    
  (define (user-defined-type? t)
    (get-extra-info (type-eval t)))

  (define (get-type-tag t)
    (syntax-parse (get-extra-info t)
      [(~constructor-extra-info tag _ _)
       (syntax-e #'tag)]))

  (define (get-type-args t)
    (syntax-parse (get-extra-info t)
      [(~constructor-extra-info _ _ get)
       (define f (syntax-local-value #'get))
       (syntax->list (f #`(get #,t)))]))

  (define (make-cons-type t args)
    (syntax-parse (get-extra-info t)
      [(~constructor-extra-info _ mk _)
       (define f (syntax-local-value #'mk))
        (type-eval (f #`(mk #,@args)))]))

  (define (ctor-id? stx)
    (and (identifier? stx)
         (user-ctor? (syntax-local-value stx (const #f)))))

  (define (untyped-ctor stx)
    (user-ctor-untyped-ctor (syntax-local-value stx (const #f)))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Syntax

(begin-for-syntax

#|
it's expensive and inflexible to fully parse these, but this is what the language
is meant to be
  (define-syntax-class stmt
    #:datum-literals (:
                      begin
                      let
                      set!
                      spawn
                      dataspace
                      stop
                      facet
                      unsafe-do
                      fields)
    (pattern (~or (begin seq:stmt ...)
                  (e1:exp e2:exp)
                  (let [f:id e:exp] let-fun-body:stmt)
                  (set! x:id e:exp)
                  (spawn τ:type s:stmt)
                  (dataspace τ:type nested:stmt ...)
                  (stop x:id s:stmt)
                  (facet x:id (fields [fn:id τf:type ef:exp] ...) ep:endpoint ...+)
                  ;; note racket expr, not exp
                  (unsafe-do rkt:expr ...))))
  
  (define-syntax-class exp
    #:datum-literals (tuple λ ref)
    (pattern (~or (o:prim-op es:exp ...)
                  basic-val
                  (k:kons1 e:exp)
                  (tuple es:exp ...)
                  (ref x:id)
                  (λ [p:pat s:stmt] ...))))
|#

  ;; constructors with arity one
  (define-syntax-class kons1
    (pattern (~or (~datum observe)
                  (~datum inbound)
                  (~datum outbound))))

  (define (kons1->constructor stx)
    (syntax-parse stx
      #:datum-literals (observe inbound outbound)
      [observe #'syndicate:observe]
      [inbound #'syndicate:inbound]
      [outbound #'syndicate:outbound]))

  (define-syntax-class basic-val
    (pattern (~or boolean
                  integer
                  string)))

  (define-syntax-class prim-op
    (pattern (~or (~literal +)
                  (~literal -)
                  (~literal displayln))))

  #;(define-syntax-class endpoint
    #:datum-literals (on start stop)
    (pattern (~or (on ed:event-desc s)
                  (assert e:expr))))

  #;(define-syntax-class event-desc
    #:datum-literals (start stop asserted retracted)
    (pattern (~or start
                  stop
                  (asserted p:pat)
                  (retracted p:pat))))
                  
  #;(define-syntax-class pat
    #:datum-literals (tuple _ discard bind)
    #:attributes (syndicate-pattern match-pattern)
    (pattern (~or (~and (tuple ps:pat ...)
                        (~bind [syndicate-pattern #'(list 'tuple ps.syndicate-pattern ...)]
                               [match-pattern #'(list 'tuple ps.match-pattern ...)]))
                  (~and (k:kons1 p:pat)
                        (~bind [syndicate-pattern #`(#,(kons1->constructor #'k) p.syndicate-pattern)]
                               [match-pattern #`(#,(kons1->constructor #'k) p.match-pattern)]))
                  (~and (bind ~! x:id τ:type)
                        (~bind [syndicate-pattern #'($ x)]
                               [match-pattern #'x]))
                  (~and discard
                        (~bind [syndicate-pattern #'_]
                               [match-pattern #'_]))
                  (~and x:id
                        (~bind [syndicate-pattern #'x]
                               [match-pattern #'(== x)]))
                  (~and e:expr
                        (~bind [syndicate-pattern #'e]
                               [match-pattern #'(== e)])))))

  (define (compile-pattern pat bind-id-transformer exp-transformer)
    (let loop ([pat pat])
      (syntax-parse pat
        #:datum-literals (tuple discard bind)
        [(tuple p ...)
         #`(list 'tuple #,@(stx-map loop #'(p ...)))]
        [(k:kons1 p)
         #`(#,(kons1->constructor #'k) #,(loop #'p))]
        [(bind x:id τ:type)
         (bind-id-transformer #'x)]
        [discard
         #'_]
        [(~constructor-exp ctor p ...)
         (define/with-syntax uctor (untyped-ctor #'ctor))
         #`(uctor #,@(stx-map loop #'(p ...)))]
        [_
         (exp-transformer pat)])))

  (define (compile-match-pattern pat)
    (compile-pattern pat
                     identity
                     (lambda (exp) #`(== #,exp))))

  (define (compile-syndicate-pattern pat)
    (compile-pattern pat
                     (lambda (id) #`($ #,id))
                     identity)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Subtyping

;; TODO: subtyping for facets

;; Type Type -> Bool
(define-for-syntax (<: t1 t2)
  #;(printf "Checking ~a <: ~a\n" (type->str t1) (type->str t2))
  ;; should add a check for type=?
  (syntax-parse #`(#,t1 #,t2)
    #;[(τ1 τ2) #:do [(displayln (type->str #'τ1))
                     (displayln (type->str #'τ2))]
               #:when #f
               (error "")]
    [((~U τ1 ...) _)
     (stx-andmap (lambda (t) (<: t t2)) #'(τ1 ...))]
    [(_ (~U τ2:type ...))
     (stx-ormap (lambda (t) (<: t1 t)) #'(τ2 ...))]
    [((~Actor τ1:type) (~Actor τ2:type))
     ;; should these be .norm? Is the invariant that inputs are always fully
     ;; evalutated/expanded?
     (and (<: #'τ1 #'τ2)
          (<: (∩ (strip-? #'τ1) #'τ2) #'τ1))]
    [((~Tuple τ1:type ...) (~Tuple τ2:type ...))
     #:when (stx-length=? #'(τ1 ...) #'(τ2 ...))
     (stx-andmap <: #'(τ1 ...) #'(τ2 ...))]
    [(_ ~★)
     (flat-type? t1)]
    [((~Observe τ1:type) (~Observe τ2:type))
     (<: #'τ1 #'τ2)]
    [((~Inbound τ1:type) (~Inbound τ2:type))
     (<: #'τ1 #'τ2)]
    [((~Outbound τ1:type) (~Outbound τ2:type))
     (<: #'τ1 #'τ2)]
    [((~constructor-type t1 τ1:type ...) (~constructor-type t2 τ2:type ...))
     #:when (tags-equal? #'t1 #'t2)
     (and (stx-length=? #'(τ1 ...) #'(τ2 ...))
          (stx-andmap <: #'(τ1 ...) #'(τ2 ...)))]
    [((~Behavior τ-v1 τ-i1 τ-o1 τ-a1) (~Behavior τ-v2 τ-i2 τ-o2 τ-a2))
     (and (<: #'τ-v1 #'τ-v2)
          ;; HMMMMMM. i2 and i1 are types of patterns. TODO
          ;; Want: ∀σ. project-safe(σ, τ-i2) ⇒ project-safe(σ, τ-i1)
          (<: #'τ-i2 #'τ-i1)
          (<: #'τ-o1 #'τ-o2)
          (<: (type-eval #'(Actor τ-a1)) (type-eval #'(Actor τ-a2))))]
    [((~→ τ-in1 ... τ-out1) (~→ τ-in2 ... τ-out2))
     #:when (stx-length=? #'(τ-in1 ...) #'(τ-in2 ...))
     (and (stx-andmap <: #'(τ-in2 ...) #'(τ-in1 ...))
          (<: #'τ-out1 #'τ-out2))]
    [((~Field τ1) (~Field τ2))
     (and (<: #'τ1 #'τ2)
          (<: #'τ2 #'τ1))]
    [(~Discard _)
     #t]
    [((~Bind τ1) (~Bind τ2))
     (<: #'τ1 #'τ2)]
    ;; should probably put this first.
    [_ (type=? t1 t2)]))

;; Flat-Type Flat-Type -> Type
(define-for-syntax (∩ t1 t2)
  (unless (and (flat-type? t1) (flat-type? t2))
    (error '∩ "expected two flat-types"))
  (syntax-parse #`(#,t1 #,t2)
    [(_ ~★)
     t1]
    [(~★ _)
     t2]
    [(_ _)
     #:when (type=? t1 t2)
     t1]
    [((~U τ1:type ...) _)
     (type-eval #`(U #,@(stx-map (lambda (t) (∩ t t2)) #'(τ1 ...))))]
    [(_ (~U τ2:type ...))
     (type-eval #`(U #,@(stx-map (lambda (t) (∩ t1 t)) #'(τ2 ...))))]
    ;; all of these fail-when/unless clauses are meant to cause this through to
    ;; the last case and result in ⊥.
    ;; Also, using <: is OK, even though <: refers to ∩, because <:'s use of ∩ is only
    ;; in the Actor case.
    [((~Tuple τ1:type ...) (~Tuple τ2:type ...))
     #:fail-unless (stx-length=? #'(τ1 ...) #'(τ2 ...)) #f
     #:with (τ ...) (stx-map ∩ #'(τ1 ...) #'(τ2 ...))
     ;; I don't think stx-ormap is part of the documented api of turnstile *shrug*
     #:fail-when (stx-ormap (lambda (t) (<: t (type-eval #'(U)))) #'(τ ...)) #f
     (type-eval #'(Tuple τ ...))]
    [((~constructor-type tag1 τ1:type ...) (~constructor-type tag2 τ2:type ...))
     #:when (tags-equal? #'tag1 #'tag2)
     #:with (τ ...) (stx-map ∩ #'(τ1 ...) #'(τ2 ...))
     #:fail-when (stx-ormap (lambda (t) (<: t (type-eval #'(U)))) #'(τ ...)) #f
     (make-cons-type t1 #'(τ ...))]
    ;; these three are just the same :(
    [((~Observe τ1:type) (~Observe τ2:type))
     #:with τ (∩ #'τ1 #'τ2)
     #:fail-when (<: #'τ (type-eval #'(U))) #f
     (type-eval #'(Observe τ))]
    [((~Inbound τ1:type) (~Inbound τ2:type))
     #:with τ (∩ #'τ1 #'τ2)
     #:fail-when (<: #'τ (type-eval #'(U))) #f
     (type-eval #'(Inbound τ))]
    [((~Outbound τ1:type) (~Outbound τ2:type))
     #:with τ (∩ #'τ1 #'τ2)
     #:fail-when (<: #'τ (type-eval #'(U))) #f
     (type-eval #'(Outbound τ))]
    [_ (type-eval #'(U))]))

;; Type Type -> Bool
;; first type is the contents of the set
;; second type is the type of a pattern
(define-for-syntax (project-safe? t1 t2)
  (syntax-parse #`(#,t1 #,t2)
    [(_ (~Bind τ2:type))
     (and (finite? t1) (<: t1 #'τ2))]
    [(_ ~Discard)
     #t]
    [((~U τ1:type ...) _)
     (stx-andmap (lambda (t) (project-safe? t t2)) #'(τ1 ...))]
    [(_ (~U τ2:type ...))
     (stx-andmap (lambda (t) (project-safe? t1 t)) #'(τ2 ...))]
    [((~Tuple τ1:type ...) (~Tuple τ2:type ...))
     #:when (overlap? t1 t2)
     (stx-andmap project-safe? #'(τ1 ...) #'(τ2 ...))]
    [((~constructor-type t1 τ1:type ...) (~constructor-type t2 τ2:type ...))
     #:when (tags-equal? #'t1 #'t2)
     (stx-andmap project-safe? #'(τ1 ...) #'(τ2 ...))]
    [((~Observe τ1:type) (~Observe τ2:type))
     (project-safe? #'τ1 #'τ2)]
    [((~Inbound τ1:type) (~Inbound τ2:type))
     (project-safe? #'τ1 #'τ2)]
    [((~Outbound τ1:type) (~Outbound τ2:type))
     (project-safe? #'τ1 #'τ2)]
    [_ #t]))

;; AssertionType PatternType -> Bool
;; Is it possible for things of these two types to match each other?
;; Flattish-Type = Flat-Types + ★, Bind, Discard (assertion and pattern types)
(define-for-syntax (overlap? t1 t2)
  (syntax-parse #`(#,t1 #,t2)
    [(~★ _) #t]
    [(_ (~Bind _)) #t]
    [(_ ~Discard) #t]
    [((~U τ1:type ...) _)
     (stx-ormap (lambda (t) (overlap? t t2)) #'(τ1 ...))]
    [(_ (~U τ2:type ...))
     (stx-ormap (lambda (t) (overlap? t1 t)) #'(τ2 ...))]
    [((~Tuple τ1:type ...) (~Tuple τ2:type ...))
     (and (stx-length=? #'(τ1 ...) #'(τ2 ...))
          (stx-andmap overlap? #'(τ1 ...) #'(τ2 ...)))]
    [((~constructor-type t1 τ1:type ...) (~constructor-type t2 τ2:type ...))
     (and (tags-equal? #'t1 #'t2)
          (stx-andmap overlap? #'(τ1 ...) #'(τ2 ...)))]
    [((~Observe τ1:type) (~Observe τ2:type))
     (overlap? #'τ1 #'τ2)]
    [((~Inbound τ1:type) (~Inbound τ2:type))
     (overlap? #'τ1 #'τ2)]
    [((~Outbound τ1:type) (~Outbound τ2:type))
     (overlap? #'τ1 #'τ2)]
    [_ (<: t1 t2)]))
    

;; Flattish-Type -> Bool
(define-for-syntax (finite? t)
  (syntax-parse t
    [~★ #f]
    [(~U τ:type ...)
     (stx-andmap finite? #'(τ ...))]
    [(~Tuple τ:type ...)
     (stx-andmap finite? #'(τ ...))]
    [(~constructor-type _ τ:type ...)
     (stx-andmap finite? #'(τ ...))]
    [(~Observe τ:type)
     (finite? #'τ)]
    [(~Inbound τ:type)
     (finite? #'τ)]
    [(~Outbound τ:type)
     (finite? #'τ)]
    [_ #t]))

;; !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
;; MODIFYING GLOBAL TYPECHECKING STATE!!!!!
;; !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

(begin-for-syntax
  (current-typecheck-relation <:))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Statements

;; CONVENTIONS
;; The `:` key is for evaluated expressions
;; The `:i` key is for input patterns
;; The `:o` key is for output assertions
;; The `:a` key is for spawned actors

(define-typed-syntax (set! x:id e:expr) ≫
  [⊢ e ≫ e- (⇒ : τ)]
  [⊢ x ≫ x- (⇒ : (~Field τ-x:type))]
  #:fail-unless (<: #'τ #'τ-x) "Ill-typed field write"
  ----------------------------------------------------
  [⊢ (x- e-) (⇒ : (U)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

(define-typed-syntax (stop facet-name:id cont) ≫
  [⊢ facet-name ≫ facet-name- (⇐ : FacetName)]
  [⊢ cont ≫ cont- (⇒ :i τ-i) (⇒ :o τ-o) (⇒ :a τ-a)]
  --------------------------------------------------
  [⊢ (syndicate:stop-facet facet-name- cont-) (⇒ : (U)) (⇒ :i τ-i) (⇒ :o τ-o) (⇒ :a τ-a)])

(define-typed-syntax (facet name:id ((~datum fields) [x:id τ:type e:expr] ...) ep ...+) ≫
  #:fail-unless (stx-andmap flat-type? #'(τ ...)) "keep your uppity data outa my fields"
  [⊢ e ≫ e- (⇐ : τ)] ...
  [[name ≫ name- : FacetName] [x ≫ x- : (Field τ)] ...
   ⊢ [ep ≫ ep- (⇒ :i τ-i) (⇒ :o τ-o) (⇒ :a τ-a)] ...]
  --------------------------------------------------------------
  ;; name NOT name- here because I get an error that way.
  ;; Since name is just an identifier I think it's OK?
  [⊢ (syndicate:react (let- ([name- (syndicate:current-facet-id)])
                            #,(make-fields #'(x- ...) #'(e- ...))
                            #;(syndicate:field [x- e-] ...)
                            ep- ...))
     (⇒ : (U)) (⇒ :i (U τ-i ...)) (⇒ :o (U τ-o ...)) (⇒ :a (U τ-a ...))])

(define-for-syntax (make-fields names inits)
  (syntax-parse #`(#,names #,inits)
    [((x:id ...) (e ...))
     #'(syndicate:field [x e] ...)]))

(define-typed-syntax (dataspace τ-c:type s ...) ≫
  ;; #:do [(printf "τ-c: ~a\n" (type->str #'τ-c.norm))]
  #:fail-unless (flat-type? #'τ-c.norm) "Communication type must be first-order"
  [⊢ s ≫ s- (⇒ :i τ-i:type) (⇒ :o τ-o:type) (⇒ :a τ-s:type)] ...
  ;; #:do [(printf "dataspace types: ~a\n" (stx-map type->str #'(τ-s.norm ...)))
  ;;      (printf "dataspace type: ~a\n" (type->str ((current-type-eval) #'(Actor τ-c.norm))))]
  #:fail-unless (stx-andmap (lambda (t) (<: (type-eval #`(Actor #,t))
                                            (type-eval #'(Actor τ-c.norm))))
                            #'(τ-s.norm ...))
                "Not all actors conform to communication type"
  #:fail-unless (stx-andmap (lambda (t) (<: t (type-eval #'(U))))
                            #'(τ-i.norm ...)) "dataspace init should only be a spawn"
  #:fail-unless (stx-andmap (lambda (t) (<: t (type-eval #'(U))))
                            #'(τ-o.norm ...)) "dataspace init should only be a spawn"
  #:with τ-ds-i (strip-inbound #'τ-c.norm)
  #:with τ-ds-o (strip-outbound #'τ-c.norm)
  #:with τ-relay (relay-interests #'τ-c.norm)
  -----------------------------------------------------------------------------------
  [⊢ (syndicate:dataspace s- ...) (⇒ : (U)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U τ-ds-i τ-ds-o τ-relay))])

(define-for-syntax (strip-? t)
  (type-eval
   (syntax-parse t
     ;; TODO: probably need to `normalize` the result
     [(~U τ ...) #`(U #,@(stx-map strip-? #'(τ ...)))]
     [~★ #'★]
     [(~Observe τ) #'τ]
     [_ #'(U)])))

(define-for-syntax (strip-inbound t)
  (type-eval
   (syntax-parse t
     ;; TODO: probably need to `normalize` the result
     [(~U τ ...) #`(U #,@(stx-map strip-? #'(τ ...)))]
     [~★ #'★]
     [(~Inbound τ) #'τ]
     [_ #'(U)])))

(define-for-syntax (strip-outbound t)
  (type-eval
   (syntax-parse t
     ;; TODO: probably need to `normalize` the result
     [(~U τ ...) #`(U #,@(stx-map strip-? #'(τ ...)))]
     [~★ #'★]
     [(~Outbound τ) #'τ]
     [_ #'(U)])))

(define-for-syntax (relay-interests t)
  (type-eval
   (syntax-parse t
     ;; TODO: probably need to `normalize` the result
     [(~U τ ...) #`(U #,@(stx-map strip-? #'(τ ...)))]
     [~★ #'★]
     [(~Observe (~Inbound τ)) #'(Observe τ)]
     [_ #'(U)])))

(define-typed-syntax (spawn τ-c:type s) ≫
  #:fail-unless (flat-type? #'τ-c.norm) "Communication type must be first-order"
  [⊢ s ≫ s- (⇒ :i τ-i:type) (⇒ :o τ-o:type) (⇒ :a τ-a:type)]
  ;; TODO: s shouldn't refer to facets or fields!
  #:fail-unless (<: #'τ-o.norm #'τ-c.norm)
                (format "Output ~a not valid in dataspace ~a" (type->str #'τ-o.norm) (type->str #'τ-c.norm))
  #:fail-unless (<: (type-eval #'(Actor τ-a.norm))
                    (type-eval #'(Actor τ-c.norm))) "Spawned actors not valid in dataspace"
  #:fail-unless (project-safe? (∩ (strip-? #'τ-o.norm) #'τ-c.norm)
                               #'τ-i.norm) "Not prepared to handle all inputs"
  ;; #:do [(printf "spawning: ~v\n" #'s-)]
  --------------------------------------------------------------------------------------------
  [⊢ (syndicate:spawn (syndicate:on-start s-)) (⇒ : (U)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a τ-c)])

(define-typed-syntax (let [f:id e:expr] body:expr) ≫
  [⊢ e ≫ e- (⇒ : τ:type)]
  #:fail-unless (or (procedure-type? #'τ.norm) (flat-type? #'τ.norm))
                (format "let doesn't bind actions; got ~a" (type->str #'τ.norm))
  [[f ≫ f- : τ] ⊢ body ≫ body- (⇒ : τ-body) (⇒ :i τ-body-i) (⇒ :o τ-body-o) (⇒ :a τ-body-a)]
   ------------------------------------------------------------------------
  [⊢ (let- ([f- e-]) body-) (⇒ : τ-body) (⇒ :i τ-body-i) (⇒ :o τ-body-o) (⇒ :a τ-body-a)])

(define-for-syntax (procedure-type? τ)
  (syntax-parse τ
    [(~→ τ ...+) #t]
    [_ #f]))

(define-typed-syntax (begin s ...) ≫
  [⊢ s ≫ s- (⇒ :i τ1) (⇒ :o τ2) (⇒ :a τ3)] ...
  ------------------------------------------
  [⊢ (begin- (void-) s- ...) (⇒ : (U)) (⇒ :i (U τ1 ...)) (⇒ :o (U τ2 ...)) (⇒ :a (U τ3 ...))])

(define-for-syntax (flat-type? τ)
  (syntax-parse τ
    [(~→ τ ...) #f]
    [(~Field _) #f]
    [(~Behavior _ _ _ _) #f]
    [_ #t]))

(define-typed-syntax (unsafe-do rkt:expr ...) ≫
  ------------------------
  [⊢ (let- () rkt ...) (⇒ : (U)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Endpoints

(begin-for-syntax
  (define-syntax-class asserted-or-retracted
    #:datum-literals (asserted retracted)
    (pattern (~or (~and asserted
                        (~bind [syndicate-kw #'syndicate:asserted]))
                  (~and retracted
                        (~bind [syndicate-kw #'syndicate:retracted]))))))

(define-typed-syntax on
  [(on (~literal start) s) ≫
   [⊢ s ≫ s- (⇒ :i τi) (⇒ :o τ-o) (⇒ :a τ-a)]
   -----------------------------------
   [⊢ (syndicate:on-start s-) (⇒ : (U)) (⇒ :i τi) (⇒ :o τ-o) (⇒ :a τ-a)]]
  [(on (~literal stop) s) ≫
   [⊢ s ≫ s- (⇒ :i τi) (⇒ :o τ-o) (⇒ :a τ-a)]
   -----------------------------------
   [⊢ (syndicate:on-stop s-) (⇒ : (U)) (⇒ :i τi) (⇒ :o τ-o) (⇒ :a τ-a)]]
  [(on (a/r:asserted-or-retracted p) s) ≫
   [⊢ p ≫ _ (⇒ : τp)]
   #:with p- (compile-syndicate-pattern #'p)
   #:with ([x:id τ:type] ...) (pat-bindings #'p)
   [[x ≫ x- : τ] ... ⊢ s ≫ s- (⇒ :i τi) (⇒ :o τ-o) (⇒ :a τ-a)]
   ;; the type of subscriptions to draw assertions to the pattern
   #:with pat-sub (replace-bind-and-discard-with-★ #'τp)
   -----------------------------------
   [⊢ (syndicate:on (a/r.syndicate-kw p-)
                    (let- ([x- x] ...) s-))
      (⇒ : (U))
      (⇒ :i (U τi τp))
      (⇒ :o (U (Observe pat-sub) τ-o))
      (⇒ :a τ-a)]])

;; FlattishType -> FlattishType
(define-for-syntax (replace-bind-and-discard-with-★ t)
  (syntax-parse t
    [(~Bind _)
     (type-eval #'★)]
    [~Discard
     (type-eval #'★)]
    [(~U τ ...)
     (type-eval #`(U #,@(stx-map replace-bind-and-discard-with-★ #'(τ ...))))]
    [(~Tuple τ ...)
     (type-eval #`(Tuple #,@(stx-map replace-bind-and-discard-with-★ #'(τ ...))))]
    [(~Observe τ)
     (type-eval #`(Observe #,(replace-bind-and-discard-with-★ #'τ)))]
    [(~Inbound τ)
     (type-eval #`(Inbound #,(replace-bind-and-discard-with-★ #'τ)))]
    [(~Outbound τ)
     (type-eval #`(Outbound #,(replace-bind-and-discard-with-★ #'τ)))]
    [(~constructor-type _ τ ...)
     (make-cons-type t (stx-map replace-bind-and-discard-with-★ #'(τ ...)))]
    [_ t]))

(define-typed-syntax (assert e:expr) ≫
  [⊢ e ≫ e- (⇒ : τ:type)]
  #:with τ-in (strip-? #'τ.norm)
  -------------------------------------
  [⊢ (syndicate:assert e-) (⇒ : (U)) (⇒ :i τ-in) (⇒ :o τ) (⇒ :a (U))])

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Expressions

(define-typed-syntax (tuple e:expr ...) ≫
  [⊢ e ≫ e- (⇒ : τ)] ...
  -----------------------
  [⊢ (list 'tuple e- ...) (⇒ : (Tuple τ ...)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

(define-typed-syntax (ref x:id) ≫
  [⊢ x ≫ x- ⇒ (~Field τ)]
  ------------------------
  [⊢ (x-) (⇒ : τ) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

(define-typed-syntax (λ [p s] ...) ≫
  #:with (([x:id τ:type] ...) ...) (stx-map pat-bindings #'(p ...))
  [[x ≫ x- : τ] ... ⊢ s ≫ s- (⇒ : τv) (⇒ :i τ1) (⇒ :o τ2) (⇒ :a τ3)] ...
  ;; REALLY not sure how to handle p/p-/p.match-pattern,
  ;; particularly w.r.t. typed terms that appear in p.match-pattern
  [⊢ p ≫ _ ⇒ τ-p] ...
  #:with (p- ...) (stx-map compile-match-pattern #'(p ...))
  #:with (τ-in ...) (stx-map lower-pattern-type #'(τ-p ...))
  --------------------------------------------------------------
  ;; TODO: add a catch-all error clause
  [⊢ (match-lambda- [p- (let- ([x- x] ...) s-)] ...)
     (⇒ : (→ (U τ-p ...) (Behavior (U τv ...) (U τ1 ...) (U τ2 ...) (U τ3 ...))))
     (⇒ :i (U))
     (⇒ :o (U))
     (⇒ :a (U))])

;; FlattishType -> FlattishType
;; replaces (Bind τ) with τ and Discard with ★
(define-for-syntax (lower-pattern-type t)
  (syntax-parse t
    [(~Bind τ)
     #'τ]
    [~Discard
     (type-eval #'★)]
    [(~U τ ...)
     (type-eval #`(U #,@(stx-map lower-pattern-type #'(τ ...))))]
    [(~Tuple τ ...)
     (type-eval #`(Tuple #,@(stx-map lower-pattern-type #'(τ ...))))]
    [(~Observe τ)
     (type-eval #`(Observe #,(lower-pattern-type #'τ)))]
    [(~Inbound τ)
     (type-eval #`(Inbound #,(lower-pattern-type #'τ)))]
    [(~Outbound τ)
     (type-eval #`(Outbound #,(lower-pattern-type #'τ)))]
    [(~constructor-type _ τ ...)
     (make-cons-type t (stx-map lower-pattern-type #'(τ ...)))]
    [_ t]))

(define-typed-syntax (typed-app e_fn e_arg ...) ≫
  [⊢ e_fn ≫ e_fn- (⇒ : (~→ τ_in:type ... (~Behavior τ-v τ-i τ-o τ-a)))]
  #:fail-unless (stx-length=? #'[τ_in ...] #'[e_arg ...])
                (num-args-fail-msg #'e_fn #'[τ_in ...] #'[e_arg ...])
  [⊢ e_arg ≫ e_arg- (⇒ : τ_arg:type)] ...
  ;; #:do [(printf "~a\n" (stx-map type->str #'(τ_arg.norm ...)))
  ;;      (printf "~a\n" (stx-map type->str #'(τ_in.norm ...) #;(stx-map lower-pattern-type #'(τ_in.norm ...))))]
  #:fail-unless (stx-andmap <: #'(τ_arg.norm ...) (stx-map lower-pattern-type #'(τ_in.norm ...)))
  "argument mismatch"
  #:fail-unless (stx-andmap project-safe? #'(τ_arg.norm ...) #'(τ_in.norm ...))
  "match error"
  ------------------------------------------------------------------------
  [⊢ (#%app- e_fn- e_arg- ...) (⇒ : τ-v) (⇒ :i τ-i) (⇒ :o τ-o) (⇒ :a τ-a)])

;; it would be nice to abstract over these three
(define-typed-syntax (observe e:expr) ≫
  [⊢ e ≫ e- (⇒ : τ)]
  ---------------------------------------------------------------------------
  [⊢ (syndicate:observe e-) (⇒ : (Observe τ)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

(define-typed-syntax (inbound e:expr) ≫
  [⊢ e ≫ e- ⇒ τ]
  ---------------------------------------------------------------------------
  [⊢ (syndicate:inbound e-) (⇒ : (Inbound τ)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

(define-typed-syntax (outbound e:expr) ≫
  [⊢ e ≫ e- ⇒ τ]
  ---------------------------------------------------------------------------
  [⊢ (syndicate:outbound e-) (⇒ : (Outbound τ)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Patterns

(define-typed-syntax (bind x:id τ:type) ≫
  ----------------------------------------
  ;; TODO: at some point put $ back in
  [⊢ (void-) (⇒ : (Bind τ)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

(define-typed-syntax discard
  [_ ≫
   --------------------
   ;; TODO: change void to _
   [⊢ (void-) (⇒ : Discard) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))]])

;; pat -> ([Id Type] ...)
(define-for-syntax (pat-bindings stx)
  (syntax-parse stx
    #:datum-literals (bind tuple)
    [(bind x:id τ:type)
     #'([x τ])]
    [(tuple p ...)
     #:with (([x:id τ:type] ...) ...) (stx-map pat-bindings #'(p ...))
     #'([x τ] ... ...)]
    [(k:kons1 p)
     (pat-bindings #'p)]
    [(~constructor-exp cons p ...)
     #:with (([x:id τ:type] ...) ...) (stx-map pat-bindings #'(p ...))
     #'([x τ] ... ...)]
    [_
     #'()]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Primitives

;; hmmm
(define-primop + (→ Int Int (Behavior Int (U) (U) (U))))
(define-primop - (→ Int Int (Behavior Int (U) (U) (U))))
(define-primop * (→ Int Int (Behavior Int (U) (U) (U))))
#;(define-primop and (→ Bool Bool (Behavior Bool (U) (U) (U))))
(define-primop or (→ Bool Bool (Behavior Bool (U) (U) (U))))
(define-primop not (→ Bool (Behavior Bool (U) (U) (U))))
(define-primop < (→ Int Int (Behavior Bool (U) (U) (U))))
(define-primop > (→ Int Int (Behavior Bool (U) (U) (U))))
(define-primop <= (→ Int Int (Behavior Bool (U) (U) (U))))
(define-primop >= (→ Int Int (Behavior Bool (U) (U) (U))))
(define-primop = (→ Int Int (Behavior Bool (U) (U) (U))))

(define-typed-syntax (/ e1 e2) ≫
  [⊢ e1 ≫ e1- (⇐ : Int)]
  [⊢ e2 ≫ e2- (⇐ : Int)]
  ------------------------
  [⊢ (exact-truncate- (/- e1- e2-)) (⇒ : Int) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

;; for some reason defining `and` as a prim op doesn't work
(define-typed-syntax (and e ...) ≫
  [⊢ e ≫ e- (⇐ : Bool)] ...
  ------------------------
  [⊢ (and- e- ...) (⇒ : Bool) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

(define-typed-syntax (equal? e1:expr e2:expr) ≫
  [⊢ e1 ≫ e1- (⇒ : τ1:type)]
  #:fail-unless (flat-type? #'τ1.norm)
  (format "equality only available on flat data; got ~a" (type->str #'τ1))
  [⊢ e2 ≫ e2- (⇐ : τ1)]
  ---------------------------------------------------------------------------
  [⊢ (equal?- e1- e2-) (⇒ : Bool) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])

(define-typed-syntax (displayln e:expr) ≫
  [⊢ e ≫ e- ⇒ τ]
  ---------------
  [⊢ (displayln- e-) (⇒ : (U)) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))])
  

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Basic Values

(define-typed-syntax #%datum
  [(_ . n:integer) ≫
  ----------------
  [⊢ (#%datum- . n) (⇒ : Int) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))]]
  [(_ . b:boolean) ≫
  ----------------
  [⊢ (#%datum- . b) (⇒ : Bool) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))]]
  [(_ . s:string) ≫
  ----------------
  [⊢ (#%datum- . s) (⇒ : String) (⇒ :i (U)) (⇒ :o (U)) (⇒ :a (U))]])

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Utilities

#;(define-syntax (begin/void-default stx)
  (syntax-parse stx
    [(_)
     (syntax/loc stx (void))]
    [(_ expr0 expr ...)
     (syntax/loc stx (begin- expr0 expr ...))]))



(define-typed-syntax (print-type e) ≫
  [⊢ e ≫ e- ⇒ τ]
  #:do [(displayln (type->str #'τ))]
  ----------------------------------
  [⊢ e- ⇒ τ])

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Extensions

(define-syntax (match stx)
  (syntax-parse stx
    [(match e [pat body] ...+)
     (syntax/loc stx
       (typed-app (λ [pat body] ...) e))]))

(define-syntax (if stx)
  (syntax-parse stx
    [(if e1 e2 e3)
     (syntax/loc stx
       (typed-app (λ [#f e3] [discard e2]) e1))]))

(define-typed-syntax (cond [pred:expr s] ...+) ≫
  [⊢ pred ≫ pred- (⇐ : Bool)] ...
  [⊢ s ≫ s- (⇒ :i τ-i) (⇒ :o τ-o) (⇒ :a τ-a)] ...
  ------------------------------------------------
  [⊢ (cond- [pred- s-] ...) (⇒ : (U)) (⇒ :i (U τ-i ...)) (⇒ :o (U τ-o ...)) (⇒ :a (U τ-a ...))])

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Tests

;; WANTED UNIT TESTS
;; (check-true (<: #'(U String) #'String))
;; (check-true (<: #'(U (U)) #'String))
;; (check-true (<: #'(Actor (U (U))) #'(Actor String))
;; (check-true (<: #'(Actor (U (U))) #'(Actor (U (Observe ★) String)))
;; (check-true (<: ((current-type-eval) #'(U (U) (U))) ((current-type-eval) #'(U))))
;; (check-false (<: ((current-type-eval) #'(Actor (U (Observe ★) String Int)))
;;                  ((current-type-eval) #'(Actor (U (Observe ★) String)))))
;; (check-true (<: (Actor (U (Observe ★) String)) (Actor (U (Observe ★) String)))

(module+ test
  (check-type 1 : Int)

  (check-type (tuple 1 2 3) : (Tuple Int Int Int))

  (check-type (tuple discard 1 (bind x Int)) : (Tuple Discard Int (Bind Int)))

  #;(check-type (λ [(bind x Int) (begin)]) : (Case [→ (Bind Int) (Facet (U) (U) (U))]))
  #;(check-true (void? ((λ [(bind x Int) (begin)]) 1))))

(define-syntax (test-syntax-class stx)
  (syntax-parse stx
    [(_ e class:id)
     #`(let ()
         (define-syntax (test-result stx)
           (syntax-parse e
             [(~var _ class) #'#t]
             [_ #'#f]))
         (test-result))]))
